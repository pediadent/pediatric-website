import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const dentistsData = [
  {
    name: 'Jeffrey Katz, D.D.S.',
    slug: 'jeffrey-katz-d-d-s',
    about: 'At Jeffrey Katz, D.D.S., their team is prepared to answer all questions pertaining to your dental health and appearance. Oral hygiene, specifically brushing and flossing, are a vital part of your dental health. They can also answer your questions about the different dental specialties and explain the meaning of dental terms.',
    address: '69-31 164th St, Fresh Meadows, Queens, NY 11365',
    phone: '(718) 380-3559',
    website: 'www.queenssmiledoc.com',
    workingHours: JSON.stringify({
      monday: '9:00 AM – 7:00 PM',
      tuesday: '9:00 AM – 7:00 PM',
      wednesday: '9:00 AM – 2:00 PM',
      thursday: '9:00 AM – 7:00 PM',
      friday: 'Closed',
      saturday: '8:00 AM – 1:00 PM',
      sunday: 'Closed'
    }),
    insurances: 'At Jeffrey Katz, D.D.S. They make every effort to provide you with the finest care and the most convenient financial options. To accomplish this they work hand-in-hand with you to maximize your insurance reimbursement for covered procedures.',
    isActive: true
  },
  {
    name: 'Preferred Dental Care',
    slug: 'preferred-dental-care',
    about: 'They will do everything possible to exceed your expectations, and keep you and your entire family coming back for a lifetime of dental care. They offer many types of dental services from regular exams and dental cleanings to professional teeth whitening and smile-improving cosmetic dentistry. They even offer smile restorations such as dental crowns or dental implants, making Preferred Dental Care your one-stop home for total oral health in Flushing, Queens New York.',
    address: '146-10 45th Ave. Flushing, Queens, NY 11355',
    phone: '(718) 445-7600',
    website: 'www.preferreddentalcare.com',
    workingHours: JSON.stringify({
      monday: '8:00 AM – 9:00 PM',
      tuesday: '8:00 AM – 9:00 PM',
      wednesday: '8:00 AM – 9:00 PM',
      thursday: '8:00 AM – 9:00 PM',
      friday: '8:00 AM – 9:00 PM',
      saturday: '8:00 AM – 9:00 PM',
      sunday: '11:00 AM – 6:00 PM'
    }),
    insurances: 'They accept and work with many traditional insurance plans, contact their office to verify acceptance of your plan.',
    isActive: true
  },
  {
    name: 'Main Children\'s Dental',
    slug: 'main-childrens-dental',
    about: '_Dr. Dutta_ works hard to get the best possible treatment for your child\'s dental problems at **Main Children\'s Dental**.',
    address: '13701 Northern Blvd, Queens, NY 11354',
    phone: '+1 7185398762',
    website: '',
    workingHours: JSON.stringify({
      info: 'Call to know the working hours.'
    }),
    insurances: 'Please call Main Children\'s Dental to know more about the insurance plans accepted.',
    isActive: true
  },
  {
    name: 'Kesner Family Dental and Pediatric Dentistry',
    slug: 'kesner-family-dental',
    about: 'If you are looking for a highly trained and experienced dentist in Flushing, you have come to the right place. At Kesner Family Dental and Pediatric Dentistry, you will receive the highest quality dental care. Their dental office uses the latest state-of-the-art equipment and cutting-edge technology and they uphold the strictest sterilization techniques.\n\nThey know that many people may feel anxious about coming to the dentist, so it is our goal to make your visit with us as pain and anxiety-free as possible. They view it as their mission to educate our patients about all of their oral health care options and to help guide them to choose a treatment plan that is most suitable and appropriate for their needs.',
    address: '154-02 71st Ave, Flushing, Queens, NY 11367',
    phone: '(718) 591-7993',
    website: 'www.queensfamilydentist.com/',
    workingHours: JSON.stringify({
      monday: '9:00 AM – 7:00 PM',
      tuesday: 'Closed',
      wednesday: '9:00 AM – 6:00 PM',
      thursday: '12:00 AM – 8:00 PM',
      friday: 'Closed',
      saturday: '9:00 AM – 3:00 PM',
      sunday: 'By appointment only.'
    }),
    insurances: 'Aetna, Cigna, Delta Dental, Empire, Blue Cross/Blue Shield, Local 3, Guardian, MetLife, CSEA, UFT, United Concordia',
    isActive: true
  },
  {
    name: 'Pleasant Dental Care',
    slug: 'pleasant-dental-care',
    about: 'Pleasant Dental Care welcomes you to experience the finest dental care in the heart of Jamaica Queens. Conveniently located on Hillside avenue and easily accessible by bus or train, Pleasant Dental Care ensures that all patients are treated in complete comfort, in a state of the art environment with the best and latest dental treatment options available. Dr. Rakesh Khilwani D.D.S and his team of skilled dental professionals will ensure that you are satisfied with the quality of work received.',
    address: '183-11 Hillside Avenue – Suite CC, Jamaica Queens, New York 11432',
    phone: '718-523-7910',
    website: 'www.pleasantdentalcare.com',
    workingHours: JSON.stringify({
      monday: '9:00 am – 7:00 pm',
      tuesday: '9:00 am – 7:00 pm',
      wednesday: '9:00 am – 7:00 pm',
      thursday: '9:00 am – 8:00 pm',
      friday: '9:00 am – 7:00 pm',
      saturday: '9:00 am – 4:00 pm',
      sunday: '9:00 am – 4:00 pm'
    }),
    insurances: 'They accept most traditional insurance. Please visit their officical site for more details.',
    isActive: true
  },
  {
    name: 'Albee Dental Care',
    slug: 'albee-dental-care',
    about: 'Healthy and beautiful smiles are their number one priority. That is why their state of the art facility offers the latest technology available along with an on-site professional staff that includes hygienist and dental specialists.\n\nAt Albee Dental Care, they offer a complete menu of the most up-to-date dental services meeting the needs of every member of your family. In addition, They\'ve taken great care to outfit their office with several amenities that will make your visit as comfortable as possible.\n\nAll of their treatment rooms are equipped with flat-screen monitors so patients can follow their treatment plan on the screen, view an informational DVD on various dental procedures, or just watch a favorite TV show.',
    address: '90-12 161st Street, Jamaica, Queens, NY 11432',
    phone: '(718)-658-0123',
    website: 'www.albeedental.com',
    workingHours: JSON.stringify({
      monday: '10:00 AM – 7:00 PM',
      tuesday: '10:00 AM – 7:00 PM',
      wednesday: '10:00 AM – 7:00 PM',
      thursday: '10:00 AM – 7:00 PM',
      friday: '10:00 AM – 7:00 PM',
      saturday: '9:00 AM – 3:00 PM',
      sunday: 'Closed'
    }),
    insurances: 'They accept most traditional insurance plans, contact their office to verify acceptance of your plan. Soma Dental does not participate in Health Management Organizations; however, they will be happy to file your insurance claims for you.',
    isActive: true
  },
  {
    name: 'Little T Kids Dentistry',
    slug: 'little-t-kids-dentistry',
    about: 'Little T Kids Dentistry specializes in dentistry for infants, children, teenagers, and special needs patients. Children are their passion and they are committed to providing a positive dental experience that sets them up for a lifetime of good oral health.\n\nTheir mission is to deliver the highest standard of care, service, and expertise for your child. Conveniently located in Jackson Heights, NY, they are here for your child\'s every need. Whether you\'re scheduling your child\'s first dental visit or looking for a new dental home, their dedicated team is excited to meet you and your child!',
    address: '86-10 Roosevelt Ave # 31, Queens, NY 11372',
    phone: '+1(917) 810-7104',
    website: 'www.littlet-kd.com',
    workingHours: JSON.stringify({
      monday: '10:00 AM – 6:00 PM',
      tuesday: '10:00 AM – 6:00 PM',
      wednesday: '10:00 AM – 6:00 PM',
      thursday: '10:00 AM – 6:00 PM',
      friday: '10:00 AM – 6:00 PM',
      saturday: '11:00 AM – 3:00 PM',
      sunday: 'Closed'
    }),
    insurances: 'They accept many insurances to make your life easier, please call their office for further details.',
    isActive: true
  },
  {
    name: 'Dr. Harold Biller',
    slug: 'jamaica-estates-dentist',
    about: 'For over 25 years Dr. Harold Biller has been serving Jamaica Estates, Fresh Meadows, Hollis & Oakland Gardens communities. They have treated the children who have now grown up to be their adult patients and they have treated their parents, who have become their valued seniors. Now Jamaica Estates Dentists are treating a new generation of children….and so the cycle continues. At their facility, you will find complete General Dentistry. They provide root canals from start to finish, periodontal services (gum work), as well as extractions, fillings, dentures, crowns and bridges, and implants.',
    address: '80-31 189th St, Jamaica Estates, Queens, NY 11423.',
    phone: '(718) 464-3647',
    website: 'www.jamaicaestatesdentist.com',
    workingHours: JSON.stringify({
      monday: '9:30 am – 8:00 PM',
      tuesday: 'Closed',
      wednesday: '9:30 am – 8:00 PM',
      thursday: 'Closed',
      friday: '9:30 am – 3:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }),
    insurances: 'At Jeffrey Katz, D.D.S. They make every effort to provide you with the finest care and the most convenient financial options. To accomplish this they work hand-in-hand with you to maximize your insurance reimbursement for covered procedures.',
    isActive: true
  },
  {
    name: 'Soma Pediatric Dentistry',
    slug: 'soma-pediatric-dentistry',
    about: 'At Soma Pediatric Dentistry, they believe that a pediatric dentist and patient become a team for treating an individual\'s dental needs. Their dentists spend most of the time listening to understand your concerns and responding with the best treatment options for their patients. With the help of its professional staff, they also follow up to make sure that general pain is relieved, problems are resolved and your health improves.',
    address: '56-11 94th St, Apt LN, Queens, NY 11373',
    phone: '(718) 760-8700',
    website: 'http://www.somakids.com/',
    workingHours: JSON.stringify({
      monday: 'Closed',
      tuesday: 'Closed',
      wednesday: '10:00 AM – 7:00 PM',
      thursday: 'Closed',
      friday: 'Closed',
      saturday: '10:00 AM – 6:00 PM',
      sunday: 'Closed'
    }),
    insurances: 'They accept most traditional insurance plans, contact their office to verify acceptance of your plan. Soma Dental does not participate in Health Management Organizations; however, they will be happy to file your insurance claims for you.',
    isActive: true
  },
  {
    name: 'Astoria Smiles Pediatric Dentistry',
    slug: 'astoria-smiles-pediatric-dentistry',
    about: 'Astoria Smiles Pediatric Dentistry is committed to giving the best possible experience at their state-of-the-art pediatric dental practice. Using a gentle and caring approach, they strive to create a fun and rewarding dental experience for all of our patients. With their preventive approach, they aim to keep their patient\'s smiles cavity-free and promote a lifetime of healthy habits.\n\nIn their state of the art dental practice, they are committed to providing high quality, affordable dental care to each of our patients. Dr. Rashmi and her staff treat each child with compassion and patience in a child-friendly environment.',
    address: '30-44 29th St #1D, Queens, NY 11102',
    phone: '(917) 832-7177',
    website: 'http://www.astoria-smiles.com/',
    workingHours: JSON.stringify({
      info: 'Visit website for more info'
    }),
    insurances: 'Astoria Smiles Pediatric Dentistry participates with most PPO Dental Insurances. Check their website for more info.\n\n- Aetna PPO\n- Anthem Blue Cross Blue Shield PPO\n- Assurant PPO\n- Cigna PPO\n- CSEA Employee Benefit\n- Delta Dental PPO and Premier\n- Emblem Health PPO and Child HealthPlus\n- Empire Blue Cross Blue Shield PPO\n- Fidelis (Child HealthPlus)\n- Guardian PPO\n- HealthFirst (Child HealthPlus)\n- Healthplex PPO\n- Humana Dental PPO\n- MetLife\n- Nippon Life\n- Principal PPO\n- Self Insured Dental (SIDS)\n- Solstice\n- United Concordia PPO\n- United Healthcare PPO and Community Plan',
    isActive: true
  },
  {
    name: 'Boutique Dental – Pediatric Dental Associates of Glendale',
    slug: 'boutique-dental-pediatric-dental-associates-of-glendale',
    about: '_Dr. Yelena Mullakandova_ is a warm and patient dentist serving her patients in the heart of Glendale, New York. Dr. Mullakandova graduated in 2009 with her Doctor of Dental Surgery degree from New York University. An active member of the American Dental Association, Dr. Mullakandova is proud to continue her dental education with a variety of ongoing courses. Dr. Mullakandova looks forward to providing your family with excellent dental care so that you can enjoy healthy, beautiful smiles for years to come. A gorgeous smile is an important source of self-confidence, and **Boutique Dental – Pediatric Dental Associates of Glendale** is eager to help you reach your goals!',
    address: '6835 Myrtle Ave, Glendale, NY 11385',
    phone: '(718) 821-0170',
    website: 'https://www.boutiquedentalny.com/pediatric-dentistry/',
    workingHours: JSON.stringify({
      monday: '9:00 AM – 6:00 PM',
      tuesday: '9:00 AM – 6:00 PM',
      wednesday: '9:00 AM – 6:00 PM',
      thursday: '9:00 AM – 6:00 PM',
      friday: '9:00 AM -3:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }),
    insurances: 'Check their official website for more insurances related information.',
    isActive: true
  },
  {
    name: 'Dental Specialties of NY',
    slug: 'dental-specialties-of-ny',
    about: 'Oral and maxillofacial surgery requires up to 6 additional years of hospital based surgical and anesthesia training. As an oral and maxillofacial surgeons, endodontists & periodontists, they manage a wide variety of problems relating to the mouth, teeth and facial regions. Dental Specialties of NY practice a full scope of oral and maxillofacial surgery, endodontic treatment, and periodontal treatment. Their staff is trained in assisting with I.V. sedation within our state of the art office setting. Patients are continuously monitored during and after surgery.',
    address: '197-11 Hillside Avenue, Hollis, NY 11423, United States',
    phone: '(718) 740-6000',
    website: 'http://www.dentalspecialtiesny.com/',
    workingHours: JSON.stringify({
      monday: '9:00 AM – 6:00 PM',
      tuesday: '9:00 AM – 6:00 PM',
      wednesday: '9:00 AM – 6:00 PM',
      thursday: '9:00 AM – 6:00 PM',
      friday: '9:00 AM – 6:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }),
    insurances: '1199, 32 BJ, HEALTHPLEX, AETNA, AMERICHOICE, ASSURANT, CIGNA, CSEA, DANIEL COOK ASSOCIATES, DC37, D.D.S., DELTA DENTAL, DENTAQUEST, EMPIRE BLUE CROSS BLUE SHIELD, GHI, GUARDIAN, HIP CARRINGTON, MAGNACARE, MALLONEY ASSOCIATES, MEDICAID, METLIFE, UFT, OXFORD, POMCO, PRINCIPAL LIFE INSURANCE, S.I.D.S., SELEDENT, UNICARE, UNITED CONCORDIA, UNITED HEALTHCARE',
    isActive: true
  },
  {
    name: 'Jackson Heights Pediatric Dental',
    slug: 'jackson-heights-pediatric-dental',
    about: 'Jackson Heights Pediatric Dental is an educational-based, prevention-focused pediatric dental practice where your children\'s imagination will be embraced through our innovative approach to dentistry. Caring for your child\'s oral health through prevention, quality treatment, and positive motivation is their top priority.',
    address: '93-20A Roosevelt Ave, Queens, NY 11373',
    phone: '(718) 434-8404',
    website: 'https://www.hellosmile.com/clinics/jackson-heights-pediatric-dental',
    workingHours: JSON.stringify({
      monday: '9:00 pm – 7:00 pm',
      tuesday: '9:00 pm – 7:00 pm',
      wednesday: '9:00 pm – 7:00 pm',
      thursday: '9:00 pm – 7:00 pm',
      friday: '9:00 pm – 4:00 pm',
      saturday: 'Closed',
      sunday: 'Closed'
    }),
    insurances: 'For information related to insurances they accept visit their website.',
    isActive: true
  },
  {
    name: 'Queens Children Dentist',
    slug: 'queens-children-dentist',
    about: 'Queens Children Dentist is committed to providing gentle, friendly, and comprehensive dental care to kids. They believe that good oral health is vital for a child\'s development, and they help in every step of the way. They take pride in creating and maintaining beautiful and healthy smiles for our younger patients in an environment that is lighthearted and fun. They focus on establishing oral health habits that last a lifetime, with education and prevention as their primary tools.',
    address: '87-08 Woodhaven Blvd 2nd floor Woodhaven, NY 11421, United States',
    phone: '(718) 847-5555',
    website: 'https://www.queenschildrendentist.com/',
    workingHours: JSON.stringify({
      monday: '10:00 AM – 6:00 PM',
      tuesday: '10:00 AM – 6:00 PM',
      wednesday: '10:00 AM – 6:00 PM',
      thursday: '10:00 AM – 6:00 PM',
      friday: '10:00 AM – 6:00 PM',
      saturday: 'Closed',
      sunday: 'Closed'
    }),
    insurances: 'Please check their official website for all the dental finance and insurance options for patients.',
    isActive: true
  },
  {
    name: 'Dental Smiles 4 Kids Pediatric Dentistry',
    slug: 'dental-smiles-4-kids',
    about: 'Providing specialized dentistry for children and adolescents in a \'child-friendly\' environment. As pediatric dentists, Dental Smiles 4 Kids focus on preventive care to help each child have a healthy smile that will last a lifetime. Serving infants, children and teens in Astoria, Ronkonkoma, Whitestone, Centereach, North Babylon, and Riverhead, NY.',
    address: '18-15 Francis Lewis Blvd, Whitestone, NY 11357, United States',
    phone: '(631)-727-8585',
    website: 'http://www.dentalsmiles4kids.com/',
    workingHours: JSON.stringify({
      monday: '10:00 AM – 6:00 PM',
      tuesday: 'Closed',
      wednesday: '10:00 AM – 6:00 PM',
      thursday: '10:00 AM – 6:00 PM',
      friday: 'Closed',
      saturday: '9:00 AM – 2:00 PM',
      sunday: 'Closed'
    }),
    insurances: 'Aetna PPO, DMO, United Healthcare PPO, Cigna PPO/DMO, CSEA – All Plans, CWA – Verizon Metlife, Careington – HIP or Signature Dental, Fidelis, BC/BS, Neighborhood, Affinity, Healthfirst, Emblem, United Healthcare Community Plan, GHI, Delta Dental, Dentemax, DDS – All Locals, Empire BC/BS, PPO, Fitzharris, GHI Preferred, Guardian PPO/DMO, Guardian Managed Dental Guard, Healthplex, Horizon BC/BS of NJ, Local 804, Metlife, Medicaid/Child Health Plus, Oxford, PBA, Sele-dent, SIDS, UFT, United Concordia',
    isActive: true
  },
  {
    name: 'Pediatric Dentistry of Flushing',
    slug: 'pediatric-dentistry-of-flushing',
    about: 'Pediatric Dentistry of Flushing is committed to helping all children achieve a lifetime of healthy smiles. Using the latest techniques, our highly trained and experienced pediatric specialists provide outstanding dental care in a comfortable, kid-friendly setting.',
    address: '135-14 Jewel Avenue, Flushing, NY 11367, United States',
    phone: '(718) 997-6453',
    website: 'https://www.pediatricdentistryflushing.com',
    workingHours: JSON.stringify({
      monday: '10:00 am – 5:00 pm',
      tuesday: '10:00 am – 5:00 pm',
      wednesday: '10:00 am – 5:00 pm',
      thursday: '10:00 am – 5:00 pm',
      friday: '10:00 am – 2:00 pm',
      saturday: '10:00 am – 2:00 pm',
      sunday: '10:00 am – 2:00 pm'
    }),
    insurances: 'Fidelis, United Healthcare – Community Plan, HealthPlex, CSEA, 1199SIEU, Emp PPO, EXC PPO/100/200/300/FFS, Aetna PPO, Cigna PPO, Guardian PPO, MetLife PPO, Delta Dental PPO, UFT, And more!',
    isActive: true
  },
  {
    name: 'Kids Only Dental',
    slug: 'kids-only-dental',
    about: 'Kids Only Dental is a \'kid\'s only\' dental practice committed to your child\'s smile. Our entire staff is dedicated to providing your child with the individualized, gentle care that they deserve. Now in our new, state-of-the-art office, we\'re able to accommodate more evening and weekend appointments.',
    address: 'Parker Towers, 104-60 Queens Blvd Suite B, Forest Hills, NY 11375, United States',
    phone: '(718) 459-7900',
    website: 'https://www.kidsonlydental.net/',
    workingHours: JSON.stringify({
      monday: '1:00 pm – 7:30 pm',
      tuesday: '10:00 am – 5:00 pm',
      wednesday: '11:00 am – 7:00 pm',
      thursday: 'Closed',
      friday: '9:00 am – 5:00 pm',
      saturday: '9:00 am – 2:00 pm',
      sunday: 'Closed'
    }),
    insurances: 'They accept most major credit cards. They do participate with some insurances, and accept others out of network. Many patients have questions concerning their insurance coverage. Because patients deserve the best service possible, Kids Only Dental strive to help in educating patients with their individual insurance coverage.',
    isActive: true
  },
  {
    name: 'Kids Dental Studio Pediatric Dentistry and Orthodontics',
    slug: 'kids-dental-studio-pediatric-dentistry-and-orthodontics',
    about: 'At Kids Dental Studio, they provide exceptional pediatric dental and orthodontic care in a comfortable and relaxing environment. Their office, from the waiting area to each treatment room, is designed to have a fun atmosphere and is equipped with high-definition televisions to help your child feel at home.',
    address: '21154 45th Dr, Bayside, NY 11361, United States',
    phone: '(718) 428-3300',
    website: 'http://www.kidsdentalstudio.com/',
    workingHours: JSON.stringify({
      monday: 'Closed',
      tuesday: '11:00 Am – 7:00 pm',
      wednesday: '9:00 am – 5:30 pm',
      thursday: '9:00 am – 5:30 pm',
      friday: '11:00 am – 7:00 pm',
      saturday: '9:00 am – 3:00 pm',
      sunday: 'Closed'
    }),
    insurances: 'They work with many of the major dental insurance companies and will be happy to help file your insurance claims; however, please understand that insurance plans are contracts between you and your insurance company and often cover only a portion of the total cost of treatment.',
    isActive: true
  }
]

async function main() {
  console.log('Starting import of dentists...')

  for (const dentist of dentistsData) {
    try {
      const existing = await prisma.dentistDirectory.findUnique({
        where: { slug: dentist.slug }
      })

      if (existing) {
        console.log(`Updating: ${dentist.name}`)
        await prisma.dentistDirectory.update({
          where: { slug: dentist.slug },
          data: dentist
        })
      } else {
        console.log(`Creating: ${dentist.name}`)
        await prisma.dentistDirectory.create({
          data: dentist
        })
      }
    } catch (error) {
      console.error(`Error importing ${dentist.name}:`, error)
    }
  }

  console.log('Import completed successfully!')
  console.log(`Total dentists imported: ${dentistsData.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
