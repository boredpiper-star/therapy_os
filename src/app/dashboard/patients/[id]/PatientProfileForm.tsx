'use client'

import { useState } from "react"
import { updatePatient } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Baby, Activity, Brain, Smile, BookOpen, Utensils, Save, ArrowLeft, HeartPulse, Pencil, X } from "lucide-react"
import Link from "next/link"

export default function PatientProfileForm({ patient }: { patient: any }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // --- 1. DATA PARSING (Safe Defaults) ---
  const concern = patient.concern_profile || {}
  const birth = patient.birth_history || {}
  const medical = patient.medical_history || {}
  const dev = patient.developmental_history || {}
  const sensory = patient.sensory_profile || {}
  const social = patient.social_skills || {}
  const emo = patient.emotional_profile || {}
  const edu = patient.education_history || {}
  const selfHelp = patient.self_help_skills || {}

  // --- 2. LOGIC FOR "EXPLAIN" BOXES ---
  const [showBirthExplain, setShowBirthExplain] = useState(!!birth.respiratory_assistance?.required)
  const [showMedExplain, setShowMedExplain] = useState(!!medical.current_medications?.taking)
  const [showAllergyExplain, setShowAllergyExplain] = useState(!!medical.food_allergies?.has_allergies)
  const [showHearExplain, setShowHearExplain] = useState(!!medical.hearing_evaluation?.evaluated)
  const [showGrossExplain, setShowGrossExplain] = useState(!!dev.gross_motor_concern?.has_concern)
  const [showFineExplain, setShowFineExplain] = useState(!!dev.fine_motor_concern?.has_concern)
  
  const [showFeedExplain, setShowFeedExplain] = useState(!!selfHelp.feeding?.has_concern)
  const [showFoodExplain, setShowFoodExplain] = useState(!!selfHelp.food_choices?.has_concern)
  const [showDressExplain, setShowDressExplain] = useState(!!selfHelp.dressing?.has_concern)
  const [showHygieneExplain, setShowHygieneExplain] = useState(!!selfHelp.hygiene?.has_concern)

  // Style helper for disabled inputs (View Mode) to make them readable
  const viewModeClass = "disabled:opacity-100 disabled:bg-slate-50 disabled:text-slate-700 disabled:border-slate-200"

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/patients">
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            {/* ADDED THE ID BADGE HERE */}
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{patient.full_name}</h1>
              {patient.display_id && (
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-mono font-bold border border-blue-200 shadow-sm">
                  {patient.display_id}
                </span>
              )}
            </div>
            <p className="text-slate-500 mt-1">
               {isEditing ? <span className="text-blue-600 font-bold">Editing Mode</span> : "View Only Profile"}
            </p>
          </div>
        </div>
        
        {/* EDIT TOGGLE */}
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm">
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(false)} className="border-red-200 text-red-600 hover:bg-red-50">
            <X className="w-4 h-4 mr-2" /> Cancel Editing
          </Button>
        )}
      </div>

      <form action={async (formData) => {
          setIsSubmitting(true)
          await updatePatient(formData)
          setIsSubmitting(false)
          setIsEditing(false)
      }}>

        <input type="hidden" name="id" value={patient.id} />

        <div className="space-y-8">
        
        {/* === SECTION: CHILD INFORMATION === */}
        <Card>
          <CardHeader className="bg-blue-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <User className="w-5 h-5" /> Child Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <Label>Child's Full Name</Label>
              <Input name="full_name" defaultValue={patient.full_name} disabled={!isEditing} className={viewModeClass} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input name="date_of_birth" type="date" defaultValue={patient.date_of_birth} disabled={!isEditing} className={viewModeClass} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select name="gender" defaultValue={patient.gender} disabled={!isEditing}>
                <SelectTrigger className={viewModeClass}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>Diagnosis</Label>
               <Input name="diagnosis" defaultValue={patient.diagnosis} disabled={!isEditing} className={viewModeClass} />
            </div>
            <div className="space-y-2 md:col-span-2">
               <Label>Referred by</Label>
               <Input name="referring_doctor" defaultValue={patient.referring_doctor} disabled={!isEditing} className={viewModeClass} />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: PARENT INFORMATION (UPDATED) === */}
        <Card>
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-slate-700">
              <User className="w-5 h-5" /> Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
            
            {/* FATHER'S COLUMN */}
            <div className="space-y-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Father's Details</h3>
               <div className="space-y-2">
                 <Label>Name</Label>
                 <Input name="father_name" defaultValue={patient.father_name} disabled={!isEditing} className={viewModeClass} />
               </div>
               <div className="space-y-2">
                 <Label>Occupation</Label>
                 <Input name="father_occupation" defaultValue={patient.father_occupation} disabled={!isEditing} className={viewModeClass} />
               </div>
               <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <Input name="father_phone" defaultValue={patient.father_phone} disabled={!isEditing} className={viewModeClass} placeholder="Father's Phone" />
               </div>
            </div>

            {/* MOTHER'S COLUMN */}
            <div className="space-y-4">
               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Mother's Details</h3>
               <div className="space-y-2">
                 <Label>Name</Label>
                 <Input name="mother_name" defaultValue={patient.mother_name} disabled={!isEditing} className={viewModeClass} />
               </div>
               <div className="space-y-2">
                 <Label>Occupation</Label>
                 <Input name="mother_occupation" defaultValue={patient.mother_occupation} disabled={!isEditing} className={viewModeClass} />
               </div>
               <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <Input name="mother_phone" defaultValue={patient.mother_phone} disabled={!isEditing} className={viewModeClass} placeholder="Mother's Phone" />
               </div>
            </div>

            <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-100">
              <Label>Home Address</Label>
              <Input name="address" defaultValue={patient.address} disabled={!isEditing} className={viewModeClass} />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: CONCERN === */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-slate-800">
                <HeartPulse className="w-5 h-5" /> Concern
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="space-y-2">
               <Label>1. When did you first have concerns about your child?</Label>
               <Input name="concern_q1" defaultValue={concern.when_first_concerns} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>2. What made you concerned?</Label>
               <Textarea name="concern_q2" defaultValue={concern.what_made_concerned} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>3. What strategies or techniques have you been trying independently?</Label>
               <Textarea name="concern_q3" defaultValue={concern.strategies_tried} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>4. What is your primary concern today?</Label>
               <Textarea name="concern_q4" defaultValue={concern.primary_concern_today} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>5. What specific skills would you like to achieve in therapy?</Label>
               <Textarea name="concern_q5" defaultValue={concern.therapy_goals} disabled={!isEditing} className={viewModeClass} />
             </div>
          </CardContent>
        </Card>

        {/* === SECTION: PREGNANCY AND BIRTH HISTORY === */}
        <Card>
          <CardHeader className="bg-purple-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Baby className="w-5 h-5" /> Pregnancy and Birth History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>1. Illnesses/Complications during pregnancy?</Label>
              <Textarea name="birth_q1" defaultValue={birth.pregnancy_complications} disabled={!isEditing} className={viewModeClass} />
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Label>2. Was your pregnancy full term?</Label>
              <RadioGroup name="birth_q2_term" defaultValue={birth.is_full_term ? "yes" : "no"} disabled={!isEditing} className="flex gap-4">
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="term-y"/><Label htmlFor="term-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="term-n"/><Label htmlFor="term-n">No</Label></div>
              </RadioGroup>
              <Input name="birth_q2_age" defaultValue={birth.gestational_age} disabled={!isEditing} placeholder="Gestational age" className={`mt-2 bg-white ${viewModeClass}`} />
            </div>

            <div className="space-y-2">
              <Label>3. Was labour and delivery normal?</Label>
              <Input name="birth_q3" defaultValue={birth.delivery_normal} disabled={!isEditing} className={viewModeClass} />
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Label>4. Was oxygen required?</Label>
              <RadioGroup name="birth_q4_check" defaultValue={birth.respiratory_assistance?.required ? "yes" : "no"} disabled={!isEditing} className="flex gap-4" onValueChange={(v) => setShowBirthExplain(v === 'yes')}>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ox-y"/><Label htmlFor="ox-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ox-n"/><Label htmlFor="ox-n">No</Label></div>
              </RadioGroup>
              {(showBirthExplain || birth.respiratory_assistance?.required) && 
                <Input name="birth_q4_explain" defaultValue={birth.respiratory_assistance?.explanation} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
              }
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: MEDICAL HISTORY === */}
        <Card>
          <CardHeader className="bg-red-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Activity className="w-5 h-5" /> Medical History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label>1. Conditions Experienced (Seizures, etc.)</Label>
              <Textarea name="med_q1" defaultValue={medical.experienced_conditions} disabled={!isEditing} className={viewModeClass} />
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>2. Currently taking medications?</Label>
               <RadioGroup name="med_q2_check" defaultValue={medical.current_medications?.taking ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mb-2" onValueChange={(v) => setShowMedExplain(v === 'yes')}>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="med-y"/><Label htmlFor="med-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="med-n"/><Label htmlFor="med-n">No</Label></div>
               </RadioGroup>
               {(showMedExplain || medical.current_medications?.taking) && 
                 <Input name="med_q2_list" defaultValue={medical.current_medications?.list} disabled={!isEditing} className={`bg-white ${viewModeClass}`} />
               }
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>3. Food Allergies?</Label>
               <RadioGroup name="med_q3_check" defaultValue={medical.food_allergies?.has_allergies ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mb-2" onValueChange={(v) => setShowAllergyExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="all-y"/><Label htmlFor="all-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="all-n"/><Label htmlFor="all-n">No</Label></div>
               </RadioGroup>
               {(showAllergyExplain || medical.food_allergies?.has_allergies) && 
                 <Input name="med_q3_list" defaultValue={medical.food_allergies?.list} disabled={!isEditing} className={`bg-white ${viewModeClass}`} />
               }
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>4. Hearing Evaluated?</Label>
               <RadioGroup name="med_q4_check" defaultValue={medical.hearing_evaluation?.evaluated ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mb-2" onValueChange={(v) => setShowHearExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="hear-y"/><Label htmlFor="hear-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="hear-n"/><Label htmlFor="hear-n">No</Label></div>
               </RadioGroup>
               {(showHearExplain || medical.hearing_evaluation?.evaluated) && 
                 <Input name="med_q4_results" defaultValue={medical.hearing_evaluation?.results} disabled={!isEditing} className={`bg-white ${viewModeClass}`} />
               }
            </div>

            <div className="space-y-2">
               <Label>5. Other Precautions</Label>
               <Textarea name="med_q5" defaultValue={medical.other_precautions} disabled={!isEditing} className={viewModeClass} />
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: DEVELOPMENTAL HISTORY === */}
        <Card>
           <CardHeader className="bg-green-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Activity className="w-5 h-5" /> Developmental History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            
            {/* Motor Development */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Motor Development (Age)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="space-y-1"><Label>Head control</Label><Input name="dev_head" defaultValue={dev.milestones?.head_control} disabled={!isEditing} className={viewModeClass} /></div>
                 <div className="space-y-1"><Label>Rolling</Label><Input name="dev_roll" defaultValue={dev.milestones?.rolling} disabled={!isEditing} className={viewModeClass} /></div>
                 <div className="space-y-1"><Label>Standing</Label><Input name="dev_stand" defaultValue={dev.milestones?.standing} disabled={!isEditing} className={viewModeClass} /></div>
                 <div className="space-y-1"><Label>Sitting</Label><Input name="dev_sit" defaultValue={dev.milestones?.sitting} disabled={!isEditing} className={viewModeClass} /></div>
                 <div className="space-y-1"><Label>Crawling</Label><Input name="dev_crawl" defaultValue={dev.milestones?.crawling} disabled={!isEditing} className={viewModeClass} /></div>
                 <div className="space-y-1"><Label>Walking</Label><Input name="dev_walk" defaultValue={dev.milestones?.walking} disabled={!isEditing} className={viewModeClass} /></div>
              </div>
            </div>

            {/* Motor Concerns */}
            <div className="space-y-4">
               <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                 <Label>Gross motor skills concerns?</Label>
                 <RadioGroup name="dev_gross_check" defaultValue={dev.gross_motor_concern?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowGrossExplain(v === 'yes')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="gross-y"/><Label htmlFor="gross-y">Yes</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="gross-n"/><Label htmlFor="gross-n">No</Label></div>
                 </RadioGroup>
                 {(showGrossExplain || dev.gross_motor_concern?.has_concern) && 
                   <Input name="dev_gross_explain" defaultValue={dev.gross_motor_concern?.explanation} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                 }
               </div>

               <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                 <Label>Fine motor skills concerns?</Label>
                 <RadioGroup name="dev_fine_check" defaultValue={dev.fine_motor_concern?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowFineExplain(v === 'yes')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="fine-y"/><Label htmlFor="fine-y">Yes</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="fine-n"/><Label htmlFor="fine-n">No</Label></div>
                 </RadioGroup>
                 {(showFineExplain || dev.fine_motor_concern?.has_concern) && 
                   <Input name="dev_fine_explain" defaultValue={dev.fine_motor_concern?.explanation} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                 }
               </div>
            </div>

            {/* Sensory Challenges */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Sensory Challenges</h3>
              <div className="space-y-3">
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">1. Visual</Label><Input name="sensory_1" defaultValue={sensory.visual} disabled={!isEditing} className={`md:col-span-2 ${viewModeClass}`} /></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">2. Auditory</Label><Input name="sensory_2" defaultValue={sensory.auditory} disabled={!isEditing} className={`md:col-span-2 ${viewModeClass}`} /></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">3. Tactile</Label><Input name="sensory_3" defaultValue={sensory.tactile} disabled={!isEditing} className={`md:col-span-2 ${viewModeClass}`} /></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">4. Vestibular</Label><Input name="sensory_4" defaultValue={sensory.vestibular} disabled={!isEditing} className={`md:col-span-2 ${viewModeClass}`} /></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">5. Other</Label><Input name="sensory_5" defaultValue={sensory.other} disabled={!isEditing} className={`md:col-span-2 ${viewModeClass}`} /></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: PLAY AND SOCIAL SKILLS === */}
        <Card>
          <CardHeader className="bg-yellow-50/50 border-b">
             <CardTitle className="flex items-center gap-2 text-yellow-700"><Smile className="w-5 h-5" /> Play and Social Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="space-y-2">
               <Label>1. Eye Contact?</Label>
               <Select name="social_1" defaultValue={social.eye_contact} disabled={!isEditing}>
                 <SelectTrigger className={viewModeClass}><SelectValue /></SelectTrigger>
                 <SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label>2. Play Preference</Label>
               <Select name="social_2" defaultValue={social.play_preference} disabled={!isEditing}>
                 <SelectTrigger className={viewModeClass}><SelectValue /></SelectTrigger>
                 <SelectContent><SelectItem value="Alone">Alone</SelectItem><SelectItem value="Others">Others</SelectItem></SelectContent>
               </Select>
             </div>
             <div className="space-y-2">
               <Label>3. Interaction Style</Label>
               <Input name="social_3" defaultValue={social.interaction_style} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>4. Greet people?</Label>
                  <Select name="social_4" defaultValue={social.greeting} disabled={!isEditing}><SelectTrigger className={viewModeClass}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>5. Follow 1-step directions?</Label>
                  <Select name="social_5" defaultValue={social.follow_directions} disabled={!isEditing}><SelectTrigger className={viewModeClass}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>6. Initiate conversation?</Label>
                  <Select name="social_6" defaultValue={social.initiate_conversation} disabled={!isEditing}><SelectTrigger className={viewModeClass}><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
             </div>
             <div className="space-y-2">
               <Label>7. Favorite Toys/Interests</Label>
               <Textarea name="social_7" defaultValue={social.favorite_toys} disabled={!isEditing} className={viewModeClass} />
             </div>
          </CardContent>
        </Card>

        {/* === SECTION: EMOTIONAL AND BEHAVIOUR === */}
        <Card>
          <CardHeader className="bg-orange-50/50 border-b">
             <CardTitle className="flex items-center gap-2 text-orange-700"><Brain className="w-5 h-5" /> Emotional and Behaviour</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="space-y-2">
               <Label>Emotional concerns</Label>
               <Textarea name="emo_1" defaultValue={emo.emotional_concerns} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>Behavioural concerns</Label>
               <Textarea name="emo_2" defaultValue={emo.behavioural_concerns} disabled={!isEditing} className={viewModeClass} />
             </div>
          </CardContent>
        </Card>

        {/* === SECTION: EDUCATION === */}
        <Card>
          <CardHeader className="bg-indigo-50/50 border-b">
             <CardTitle className="flex items-center gap-2 text-indigo-700"><BookOpen className="w-5 h-5" /> Education</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
             <div className="space-y-2">
               <Label>1. School Attendance</Label>
               <Input name="edu_1" defaultValue={edu.school_attendance} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>2. Grade</Label>
               <Input name="edu_2" defaultValue={edu.grade} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>3. Services Received</Label>
               <Textarea name="edu_3" defaultValue={edu.services_received} disabled={!isEditing} className={viewModeClass} />
             </div>
             <div className="space-y-2">
               <Label>4. Specific Challenges</Label>
               <Textarea name="edu_4" defaultValue={edu.challenges} disabled={!isEditing} className={viewModeClass} />
             </div>
          </CardContent>
        </Card>

        {/* === SECTION: SELF-HELP SKILLS === */}
        <Card>
          <CardHeader className="bg-teal-50/50 border-b">
             <CardTitle className="flex items-center gap-2 text-teal-700"><Utensils className="w-5 h-5" /> Self-Help Skills</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
             {/* Feeding */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Feeding/Eating concerns?</Label>
                <RadioGroup name="help_1_check" defaultValue={selfHelp.feeding?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowFeedExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="feed-y"/><Label htmlFor="feed-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="feed-n"/><Label htmlFor="feed-n">No</Label></div>
                </RadioGroup>
                {(showFeedExplain || selfHelp.feeding?.has_concern) && 
                  <Input name="help_1_explain" defaultValue={selfHelp.feeding?.explain} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                }
             </div>

             {/* Food Choices */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Food Choices concerns?</Label>
                <RadioGroup name="help_2_check" defaultValue={selfHelp.food_choices?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowFoodExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="food-y"/><Label htmlFor="food-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="food-n"/><Label htmlFor="food-n">No</Label></div>
                </RadioGroup>
                {(showFoodExplain || selfHelp.food_choices?.has_concern) && 
                  <Input name="help_2_explain" defaultValue={selfHelp.food_choices?.explain} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                }
             </div>

             {/* Dressing */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Dressing concerns?</Label>
                <RadioGroup name="help_3_check" defaultValue={selfHelp.dressing?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowDressExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="dress-y"/><Label htmlFor="dress-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="dress-n"/><Label htmlFor="dress-n">No</Label></div>
                </RadioGroup>
                {(showDressExplain || selfHelp.dressing?.has_concern) && 
                  <Input name="help_3_explain" defaultValue={selfHelp.dressing?.explain} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                }
             </div>

             {/* Hygiene */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Hygiene concerns?</Label>
                <RadioGroup name="help_4_check" defaultValue={selfHelp.hygiene?.has_concern ? "yes" : "no"} disabled={!isEditing} className="flex gap-4 mt-2" onValueChange={(v) => setShowHygieneExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="hyg-y"/><Label htmlFor="hyg-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="hyg-n"/><Label htmlFor="hyg-n">No</Label></div>
                </RadioGroup>
                {(showHygieneExplain || selfHelp.hygiene?.has_concern) && 
                  <Input name="help_4_explain" defaultValue={selfHelp.hygiene?.explain} disabled={!isEditing} className={`mt-2 bg-white ${viewModeClass}`} />
                }
             </div>
          </CardContent>
        </Card>

        {/* SAVE BUTTON (Only visible when editing) */}
        {isEditing && (
            <div className="flex justify-end pb-12 sticky bottom-4 z-10">
               <Button size="lg" className="w-48 bg-green-600 hover:bg-green-700 text-lg h-14 shadow-xl border-2 border-white" disabled={isSubmitting}>
                 {isSubmitting ? "Saving..." : "Save Changes"} <Save className="ml-2 w-5 h-5" />
               </Button>
            </div>
        )}

        </div>
      </form>
    </div>
  )
}