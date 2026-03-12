'use server'

import { createClient } from "@/utils/supabase/server"
import { addDays, addWeeks, addMonths, format, parse, parseISO, addMinutes, isBefore, isSameDay, getDay } from "date-fns"

// --- TYPES ---
export type RecurrenceConfig = {
  patientId: string
  therapistId: string
  startTime: string // "14:00"
  startDate: string // "2026-01-27"
  endDate: string   // "2026-07-21"
  frequency: 'daily' | 'weekly' | 'monthly'
  interval: number  // e.g., every "2" weeks
  selectedDays: number[] // 0=Sun, 1=Mon, etc. (Only for weekly)
}

export type SlotCheckResult = {
  date: string
  time: string
  end_time: string
  status: 'available' | 'conflict'
  conflictReason?: string
}

// --- HELPER: GENERATE DATES ---
function generateDates(config: RecurrenceConfig): Date[] {
  const dates: Date[] = []
  let current = parseISO(config.startDate)
  const end = parseISO(config.endDate)

  // Safety break to prevent infinite loops
  let safetyCounter = 0
  const MAX_SESSIONS = 52 // Cap at 1 year of weekly sessions roughly

  while ((isBefore(current, end) || isSameDay(current, end)) && safetyCounter < MAX_SESSIONS) {
    
    // 1. WEEKLY LOGIC (Most Complex)
    if (config.frequency === 'weekly') {
      // Check if current day is one of the selected days
      const currentDayOfWeek = getDay(current)
      if (config.selectedDays.includes(currentDayOfWeek)) {
        dates.push(current)
        safetyCounter++
      }

      // If we are at the end of the week (Saturday), jump by interval
      // Otherwise, just go to next day to check if it's selected
      // Actually, easier strategy: Find valid days in this week, then jump 'interval' weeks.
      
      // Better Strategy for Weekly:
      // We are iterating day by day? No, that's slow.
      // Let's iterate week by week.
    } 
    // ... Actually, let's simplify the loop for robustness:
    break; // refactoring below for cleaner logic
  }
  
  // --- REWRITTEN GENERATOR FOR CLARITY ---
  const validDates: Date[] = []
  let cursor = parseISO(config.startDate)
  const cutoff = parseISO(config.endDate)
  let count = 0

  while ((isBefore(cursor, cutoff) || isSameDay(cursor, cutoff)) && count < 100) {
    
    if (config.frequency === 'daily') {
      validDates.push(cursor)
      cursor = addDays(cursor, config.interval)
    } 
    
    else if (config.frequency === 'weekly') {
      // For this week, check all selected days
      // We need to be careful not to add dates BEFORE the start date if we align to Sunday
      const dayOfWeek = getDay(cursor) // 0-6
      
      // If the cursor is on a valid day, add it
      if (config.selectedDays.includes(dayOfWeek)) {
        validDates.push(cursor)
      }

      // Move to next day? No, handle interval.
      // Simple approach: Iterate day by day, but reset counter on weeks? 
      // Too hard. 
      // SIMPLEST APPROACH: Just add dates manually.
      
      // Let's assume user picks a start date. We check if that start date matches, then add interval.
      // Use the MS Teams logic: "Occurs every Tuesday". 
      // If user selects multiple days (Tue, Thu), we treat it as a pattern.
      
      // RE-RE-STRATEGY: 
      // 1. Iterate through the weeks based on interval.
      // 2. In each valid week, pick the specific days (Mon, Wed).
      
      // NOTE: This requires aligning 'cursor' to the start of the week.
      // To keep it simple for this version: We will just increment by 1 day and check validity.
      // If we hit end of week, we verify if we skip weeks.
    }

    else if (config.frequency === 'monthly') {
      validDates.push(cursor)
      cursor = addMonths(cursor, config.interval)
    }
    
    count++
  }
  
  // FINAL STRATEGY (Robust & Simple)
  // We will iterate day-by-day for the entire range.
  // It's fast enough for < 1 year ranges.
  const finalDates: Date[] = []
  let iter = parseISO(config.startDate)
  const finalStop = parseISO(config.endDate)
  let sanity = 0

  // Find the "Week Anchor" (Start of the very first week)
  // We use this to calculate "Is this a skipped week?"
  const startOfWeekEpoch = parseISO(config.startDate) 
  // actually, simplified:
  
  if (config.frequency === 'daily') {
    let curr = parseISO(config.startDate)
    while (isBefore(curr, finalStop) || isSameDay(curr, finalStop)) {
       finalDates.push(curr)
       curr = addDays(curr, config.interval)
    }
  }
  else if (config.frequency === 'monthly') {
    let curr = parseISO(config.startDate)
    while (isBefore(curr, finalStop) || isSameDay(curr, finalStop)) {
       finalDates.push(curr)
       curr = addMonths(curr, config.interval)
    }
  }
  else if (config.frequency === 'weekly') {
    let curr = parseISO(config.startDate)
    // We need to track "Week Index" to handle "Every 2 weeks"
    // But "Every 2 weeks" is relative to the start date.
    
    // We iterate week chunks
    while (isBefore(curr, finalStop) || isSameDay(curr, finalStop)) {
       // check the 7 days of this specific week
       for (let d = 0; d < 7; d++) {
         const tempDate = addDays(curr, d)
         // Don't go past end date
         if (isBefore(finalStop, tempDate)) break;
         
         // If this day (0-6) is in our selected list
         if (config.selectedDays.includes(getDay(tempDate))) {
            // AND it is not before the actual start date (edge case)
            if (!isBefore(tempDate, parseISO(config.startDate))) {
              finalDates.push(tempDate)
            }
         }
       }
       // Jump by interval weeks
       curr = addWeeks(curr, config.interval)
    }
  }

  return finalDates
}

// 1. CHECK CONFLICTS
export async function checkSeriesConflicts(config: RecurrenceConfig): Promise<SlotCheckResult[]> {
  const supabase = await createClient()
  const results: SlotCheckResult[] = []
  
  // Generate the target dates based on complex rules
  const targetDates = generateDates(config)

  for (const dateObj of targetDates) {
    const dateStr = format(dateObj, 'yyyy-MM-dd')
    
    // Calculate End Time
    const parsedTime = parse(config.startTime, 'HH:mm', new Date())
    const endTime = format(addMinutes(parsedTime, 60), 'HH:mm') // Default 60 mins

    const { data: conflict } = await supabase
      .from('appointments')
      .select('id, patient_name')
      .eq('therapist_id', config.therapistId)
      .eq('date', dateStr)
      .eq('start_time', config.startTime)
      .neq('status', 'cancelled')
      .maybeSingle()

    if (conflict) {
      results.push({
        date: dateStr,
        time: config.startTime,
        end_time: endTime,
        status: 'conflict',
        conflictReason: `Clash with ${conflict.patient_name}`
      })
    } else {
      results.push({
        date: dateStr,
        time: config.startTime,
        end_time: endTime,
        status: 'available'
      })
    }
  }

  return results
}

// 2. SAVE SERIES
export async function bookSeries(
  patientId: string, 
  patientName: string, 
  therapistId: string, 
  slots: SlotCheckResult[]
) {
  const supabase = await createClient()

  const appointmentsToInsert = slots.map(slot => ({
    patient_id: patientId,
    patient_name: patientName,
    therapist_id: therapistId,
    date: slot.date,
    start_time: slot.time,
    end_time: slot.end_time,
    status: 'scheduled',
    type: 'Series'
  }))

  const { error } = await supabase.from('appointments').insert(appointmentsToInsert)

  if (error) {
    console.error("Supabase Series Error:", error)
    throw new Error(`DB Error: ${error.message}`)
  }
  
  return { success: true }
}