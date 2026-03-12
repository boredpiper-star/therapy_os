'use client'

import { createPatient } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { User, Baby, Activity, Brain, Smile, BookOpen, Utensils, Save, ArrowLeft, HeartPulse } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function NewPatientPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Toggles for "Explain" boxes
  const [showBirthExplain, setShowBirthExplain] = useState(false)
  const [showMedExplain, setShowMedExplain] = useState(false)
  const [showAllergyExplain, setShowAllergyExplain] = useState(false)
  const [showHearExplain, setShowHearExplain] = useState(false)
  const [showGrossExplain, setShowGrossExplain] = useState(false)
  const [showFineExplain, setShowFineExplain] = useState(false)
  const [showFeedExplain, setShowFeedExplain] = useState(false)
  const [showFoodExplain, setShowFoodExplain] = useState(false)
  const [showDressExplain, setShowDressExplain] = useState(false)
  const [showHygieneExplain, setShowHygieneExplain] = useState(false)

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/patients">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Patient Onboarding</h1>
          <p className="text-slate-500">Complete thorough evaluation form.</p>
        </div>
      </div>

      <form action={createPatient} onSubmit={() => setIsSubmitting(true)} className="space-y-8">
        
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
              <Input name="full_name" required placeholder="Legal Name" />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input name="date_of_birth" type="date" required />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select name="gender">
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
               <Label>Diagnosis</Label>
               <Input name="diagnosis" placeholder="If applicable" />
            </div>
            <div className="space-y-2 md:col-span-2">
               <Label>Referred by</Label>
               <Input name="referring_doctor" placeholder="Doctor or Agency Name" />
            </div>
            <div className="md:col-span-2 bg-slate-50 p-4 rounded text-sm text-slate-500 italic border border-slate-100">
              We request this information for the purpose of completing a thorough evaluation of your child. 
              Depending on your child's abilities, some questions may not be applicable.
            </div>
          </CardContent>
        </Card>

        {/* === SECTION: PARENT INFORMATION (NEW STRUCTURE) === */}
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
                 <Input name="father_name" placeholder="Father's Name" />
               </div>
               <div className="space-y-2">
                 <Label>Occupation</Label>
                 <Input name="father_occupation" />
               </div>
               <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <Input name="father_phone" placeholder="Father's Phone" />
               </div>
            </div>

            {/* MOTHER'S COLUMN */}
            <div className="space-y-4">
               <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Mother's Details</h3>
               <div className="space-y-2">
                 <Label>Name</Label>
                 <Input name="mother_name" placeholder="Mother's Name" />
               </div>
               <div className="space-y-2">
                 <Label>Occupation</Label>
                 <Input name="mother_occupation" />
               </div>
               <div className="space-y-2">
                 <Label>Phone Number</Label>
                 <Input name="mother_phone" placeholder="Mother's Phone" />
               </div>
            </div>

            <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-100">
              <Label>Home Address</Label>
              <Input name="address" placeholder="Street, City, Zip" />
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
               <Input name="concern_q1" />
             </div>
             <div className="space-y-2">
               <Label>2. What made you concerned?</Label>
               <Textarea name="concern_q2" />
             </div>
             <div className="space-y-2">
               <Label>3. What strategies or techniques have you been trying independently?</Label>
               <Textarea name="concern_q3" />
             </div>
             <div className="space-y-2">
               <Label>4. What is your primary concern today?</Label>
               <Textarea name="concern_q4" />
             </div>
             <div className="space-y-2">
               <Label>5. What specific skills would you like to achieve in therapy?</Label>
               <Textarea name="concern_q5" />
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
              <Textarea name="birth_q1" />
            </div>
            
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Label>2. Was your pregnancy full term?</Label>
              <RadioGroup name="birth_q2_term" defaultValue="yes" className="flex gap-4">
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="term-y"/><Label htmlFor="term-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="term-n"/><Label htmlFor="term-n">No</Label></div>
              </RadioGroup>
              <Input name="birth_q2_age" placeholder="If not, please give gestational age:" className="mt-2 bg-white" />
            </div>

            <div className="space-y-2">
              <Label>3. Was labour and delivery normal?</Label>
              <Input name="birth_q3" placeholder="Yes / No (Explain if needed)" />
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <Label>4. Was oxygen required?</Label>
              <RadioGroup name="birth_q4_check" className="flex gap-4" onValueChange={(v) => setShowBirthExplain(v === 'yes')}>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="ox-y"/><Label htmlFor="ox-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="ox-n"/><Label htmlFor="ox-n">No</Label></div>
              </RadioGroup>
              {showBirthExplain && <Input name="birth_q4_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
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
              <Textarea name="med_q1" />
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>2. Currently taking medications?</Label>
               <RadioGroup name="med_q2_check" className="flex gap-4 mb-2" onValueChange={(v) => setShowMedExplain(v === 'yes')}>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="med-y"/><Label htmlFor="med-y">Yes</Label></div>
                 <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="med-n"/><Label htmlFor="med-n">No</Label></div>
               </RadioGroup>
               {showMedExplain && <Input name="med_q2_list" placeholder="Please list medications..." className="bg-white" />}
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>3. Food Allergies?</Label>
               <RadioGroup name="med_q3_check" className="flex gap-4 mb-2" onValueChange={(v) => setShowAllergyExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="all-y"/><Label htmlFor="all-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="all-n"/><Label htmlFor="all-n">No</Label></div>
               </RadioGroup>
               {showAllergyExplain && <Input name="med_q3_list" placeholder="Please list allergies..." className="bg-white" />}
            </div>

            <div className="space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-100">
               <Label>4. Hearing Evaluated?</Label>
               <RadioGroup name="med_q4_check" className="flex gap-4 mb-2" onValueChange={(v) => setShowHearExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="hear-y"/><Label htmlFor="hear-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="hear-n"/><Label htmlFor="hear-n">No</Label></div>
               </RadioGroup>
               {showHearExplain && <Input name="med_q4_results" placeholder="When and what were the results?" className="bg-white" />}
            </div>

            <div className="space-y-2">
               <Label>5. Other Precautions</Label>
               <Textarea name="med_q5" />
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
                 <div className="space-y-1"><Label>Head control</Label><Input name="dev_head" placeholder="Age" /></div>
                 <div className="space-y-1"><Label>Rolling</Label><Input name="dev_roll" placeholder="Age" /></div>
                 <div className="space-y-1"><Label>Standing</Label><Input name="dev_stand" placeholder="Age" /></div>
                 <div className="space-y-1"><Label>Sitting</Label><Input name="dev_sit" placeholder="Age" /></div>
                 <div className="space-y-1"><Label>Crawling</Label><Input name="dev_crawl" placeholder="Age" /></div>
                 <div className="space-y-1"><Label>Walking</Label><Input name="dev_walk" placeholder="Age" /></div>
              </div>
            </div>

            {/* Motor Concerns */}
            <div className="space-y-4">
               <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                 <Label>Gross motor skills concerns?</Label>
                 <RadioGroup name="dev_gross_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowGrossExplain(v === 'yes')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="gross-y"/><Label htmlFor="gross-y">Yes</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="gross-n"/><Label htmlFor="gross-n">No</Label></div>
                 </RadioGroup>
                 {showGrossExplain && <Input name="dev_gross_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
               </div>

               <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                 <Label>Fine motor skills concerns?</Label>
                 <RadioGroup name="dev_fine_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowFineExplain(v === 'yes')}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="fine-y"/><Label htmlFor="fine-y">Yes</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="fine-n"/><Label htmlFor="fine-n">No</Label></div>
                 </RadioGroup>
                 {showFineExplain && <Input name="dev_fine_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
               </div>
            </div>

            {/* Sensory Challenges */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800 border-b pb-2">Sensory Challenges</h3>
              <div className="space-y-3">
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">1. Visual</Label><Input name="sensory_1" className="md:col-span-2"/></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">2. Auditory</Label><Input name="sensory_2" className="md:col-span-2"/></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">3. Tactile</Label><Input name="sensory_3" className="md:col-span-2"/></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">4. Vestibular</Label><Input name="sensory_4" className="md:col-span-2"/></div>
                 <div className="grid md:grid-cols-3 items-center gap-2"><Label className="md:col-span-1">5. Other</Label><Input name="sensory_5" className="md:col-span-2"/></div>
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
               <Select name="social_1"><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
             </div>
             <div className="space-y-2">
               <Label>2. Play Preference</Label>
               <Select name="social_2"><SelectTrigger><SelectValue placeholder="Select..."/></SelectTrigger><SelectContent><SelectItem value="Alone">Alone</SelectItem><SelectItem value="Others">Others</SelectItem></SelectContent></Select>
             </div>
             <div className="space-y-2">
               <Label>3. Interaction Style</Label>
               <Input name="social_3" />
             </div>
             <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>4. Greet people?</Label>
                  <Select name="social_4"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>5. Follow 1-step directions?</Label>
                  <Select name="social_5"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                  <Label>6. Initiate conversation?</Label>
                  <Select name="social_6"><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Yes">Yes</SelectItem><SelectItem value="No">No</SelectItem><SelectItem value="Sometimes">Sometimes</SelectItem></SelectContent></Select>
                </div>
             </div>
             <div className="space-y-2">
               <Label>7. Favorite Toys/Interests</Label>
               <Textarea name="social_7" />
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
               <Textarea name="emo_1" />
             </div>
             <div className="space-y-2">
               <Label>Behavioural concerns</Label>
               <Textarea name="emo_2" />
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
               <Input name="edu_1" />
             </div>
             <div className="space-y-2">
               <Label>2. Grade</Label>
               <Input name="edu_2" />
             </div>
             <div className="space-y-2">
               <Label>3. Services Received</Label>
               <Textarea name="edu_3" />
             </div>
             <div className="space-y-2">
               <Label>4. Specific Challenges</Label>
               <Textarea name="edu_4" />
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
                <RadioGroup name="help_1_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowFeedExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="feed-y"/><Label htmlFor="feed-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="feed-n"/><Label htmlFor="feed-n">No</Label></div>
                </RadioGroup>
                {showFeedExplain && <Input name="help_1_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
             </div>

             {/* Food Choices */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Food Choices concerns?</Label>
                <RadioGroup name="help_2_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowFoodExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="food-y"/><Label htmlFor="food-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="food-n"/><Label htmlFor="food-n">No</Label></div>
                </RadioGroup>
                {showFoodExplain && <Input name="help_2_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
             </div>

             {/* Dressing */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Dressing concerns?</Label>
                <RadioGroup name="help_3_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowDressExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="dress-y"/><Label htmlFor="dress-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="dress-n"/><Label htmlFor="dress-n">No</Label></div>
                </RadioGroup>
                {showDressExplain && <Input name="help_3_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
             </div>

             {/* Hygiene */}
             <div className="space-y-2 bg-slate-50 p-4 rounded border border-slate-100">
                <Label>Hygiene concerns?</Label>
                <RadioGroup name="help_4_check" className="flex gap-4 mt-2" onValueChange={(v) => setShowHygieneExplain(v === 'yes')}>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="yes" id="hyg-y"/><Label htmlFor="hyg-y">Yes</Label></div>
                  <div className="flex items-center space-x-2"><RadioGroupItem value="no" id="hyg-n"/><Label htmlFor="hyg-n">No</Label></div>
                </RadioGroup>
                {showHygieneExplain && <Input name="help_4_explain" placeholder="Please explain..." className="mt-2 bg-white" />}
             </div>
          </CardContent>
        </Card>

        {/* === FOOTER: SUBMIT BUTTON === */}
        <div className="flex items-center justify-between pb-12 pt-4 border-t">
           <p className="text-sm text-slate-500">Sessions are 40 minutes. We encourage parents to be present.</p>
           <Button size="lg" className="w-48 bg-green-600 hover:bg-green-700 text-lg h-12 shadow-lg shadow-green-100" disabled={isSubmitting}>
             {isSubmitting ? "Creating Profile..." : "Submit Form"} <Save className="ml-2 w-5 h-5" />
           </Button>
        </div>

      </form>
    </div>
  )
}