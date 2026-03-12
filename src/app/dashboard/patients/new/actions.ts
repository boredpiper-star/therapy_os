'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function createPatient(formData: FormData) {
  const supabase = await createClient()

  // --- HELPER FUNCTIONS ---
  const get = (key: string) => formData.get(key)?.toString().trim() || ""
  const getCheck = (key: string) => formData.get(key) === "on"
  const getRadio = (key: string) => formData.get(key)?.toString() || "No"

  // --- 1. PREPARE DATA ---
  const full_name = get("full_name")
  
  // Split Full Name (Legacy Support)
  const nameParts = full_name.split(' ')
  const firstName = nameParts[0] || ""
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ""

  // DERIVE GUARDIAN INFO (To satisfy DB constraints without asking user)
  // We prefer Mother's name, then Father's name, then a fallback.
  const guardianName = get("mother_name") || get("father_name") || "Primary Guardian"
  // We prefer Mother's phone, then Father's phone for the main contact slot
  const mainPhone = get("mother_phone") || get("father_phone") 

  // --- 2. CONSTRUCT JSON PROFILES ---
  const concern_profile = {
    when_first_concerns: get("concern_q1"),
    what_made_concerned: get("concern_q2"),
    strategies_tried: get("concern_q3"),
    primary_concern_today: get("concern_q4"),
    therapy_goals: get("concern_q5"),
  }

  const birth_history = {
    pregnancy_complications: get("birth_q1"),
    is_full_term: getRadio("birth_q2_term") === "yes",
    gestational_age: get("birth_q2_age"), 
    delivery_normal: get("birth_q3"), 
    respiratory_assistance: {
        required: getRadio("birth_q4_check") === "yes",
        explanation: get("birth_q4_explain")
    }
  }

  const medical_history = {
    experienced_conditions: get("med_q1"),
    current_medications: {
        taking: getRadio("med_q2_check") === "yes",
        list: get("med_q2_list")
    },
    food_allergies: {
        has_allergies: getRadio("med_q3_check") === "yes",
        list: get("med_q3_list")
    },
    hearing_evaluation: {
        evaluated: getRadio("med_q4_check") === "yes",
        results: get("med_q4_results")
    },
    other_precautions: get("med_q5"),
  }

  const developmental_history = {
    milestones: {
      head_control: get("dev_head"),
      rolling: get("dev_roll"),
      standing: get("dev_stand"),
      sitting: get("dev_sit"),
      crawling: get("dev_crawl"),
      walking: get("dev_walk"),
    },
    gross_motor_concern: {
      has_concern: getRadio("dev_gross_check") === "yes",
      explanation: get("dev_gross_explain")
    },
    fine_motor_concern: {
      has_concern: getRadio("dev_fine_check") === "yes",
      explanation: get("dev_fine_explain")
    }
  }

  const sensory_profile = {
    visual: get("sensory_1"),
    auditory: get("sensory_2"),
    tactile: get("sensory_3"),
    vestibular: get("sensory_4"),
    other: get("sensory_5"),
  }

  const social_skills = {
    eye_contact: get("social_1"),
    play_preference: get("social_2"),
    interaction_style: get("social_3"),
    greeting: get("social_4"),
    follow_directions: get("social_5"),
    initiate_conversation: get("social_6"),
    favorite_toys: get("social_7"),
  }

  const emotional_profile = {
    emotional_concerns: get("emo_1"),
    behavioural_concerns: get("emo_2"),
  }

  const education_history = {
    school_attendance: get("edu_1"),
    grade: get("edu_2"),
    services_received: get("edu_3"),
    challenges: get("edu_4"),
  }

  const self_help_skills = {
    feeding: { 
        has_concern: getRadio("help_1_check") === "yes", 
        explain: get("help_1_explain") 
    },
    food_choices: { 
        has_concern: getRadio("help_2_check") === "yes", 
        explain: get("help_2_explain") 
    },
    dressing: { 
        has_concern: getRadio("help_3_check") === "yes", 
        explain: get("help_3_explain") 
    },
    hygiene: { 
        has_concern: getRadio("help_4_check") === "yes", 
        explain: get("help_4_explain") 
    },
  }


  // --- 3. DATABASE INSERTION ---
  const { data, error } = await supabase.from("patients").insert({
    // Standard Fields
    full_name: full_name,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: get("date_of_birth") || null,
    gender: get("gender"),
    diagnosis: get("diagnosis"),
    referring_doctor: get("referring_doctor"), // Matches new UI name
    
    // Parent Info (Updated)
    guardian_name: guardianName, // Filled automatically
    guardian_phone: mainPhone,   // Filled automatically as fallback
    
    father_name: get("father_name"),
    father_occupation: get("father_occupation"),
    father_phone: get("father_phone"), // NEW

    mother_name: get("mother_name"),
    mother_occupation: get("mother_occupation"),
    mother_phone: get("mother_phone"), // NEW
    
    address: get("address"),
    
    // JSON Profiles
    concern_profile,
    birth_history,
    medical_history,
    developmental_history,
    sensory_profile,
    social_skills,
    emotional_profile,
    education_history,
    self_help_skills

  }).select().single()

  if (error) {
    console.error("Error creating patient:", error)
    throw new Error("Failed to create patient profile.") 
  }

  redirect(`/dashboard/patients/${data.id}`)
}