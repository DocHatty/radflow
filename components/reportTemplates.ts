export interface ReportTemplate {
  studyType: string[];
  findings: string;
  impression: string;
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // --- HEAD & NECK ---
  {
    studyType: ["ct head without contrast", "ct brain without contrast", "non-contrast head ct"],
    findings: `FINDINGS:
Brain parenchyma demonstrates normal gray-white matter differentiation. No evidence of acute intracranial hemorrhage, territorial infarct, or space-occupying lesion.

Ventricular system and basal cisterns are unremarkable in size and configuration. No midline shift is identified.

Visualized portions of the skull and scalp are unremarkable.`,
    impression: `IMPRESSION:
No acute intracranial process.`,
  },
  {
    studyType: ["mri brain without contrast", "non-contrast brain mri"],
    findings: `FINDINGS:
Brain parenchyma demonstrates normal signal intensity without evidence of acute infarction, hemorrhage, or mass.

Ventricular system and sulci are of normal size for the patient's age. No abnormal enhancement is seen.

Major intracranial flow voids are patent.

Visualized paranasal sinuses and mastoid air cells are clear.`,
    impression: `IMPRESSION:
Unremarkable MRI of the brain without contrast.`,
  },
  {
    studyType: ["ct neck with contrast", "contrast-enhanced neck ct"],
    findings: `FINDINGS:
Pharynx and larynx appear symmetric and unremarkable. Thyroid and salivary glands are homogeneous in attenuation without focal lesions. No pathologic cervical lymphadenopathy is identified.

Visualized portions of the carotid arteries and jugular veins are patent. Airway is patent. Osseous structures are intact.`,
    impression: `IMPRESSION:
No acute abnormality in the soft tissues of the neck.`,
  },
  {
    studyType: ["ct orbits without contrast"],
    findings: `FINDINGS:
Globes are symmetric in size and shape with normal intraocular density. Optic nerves, extraocular muscles, and orbital fat are unremarkable.

Bony orbits are intact. Visualized portions of the paranasal sinuses are clear.`,
    impression: `IMPRESSION:
Unremarkable non-contrast CT of the orbits.`,
  },
  {
    studyType: ["mra head without contrast", "mra brain"],
    findings: `FINDINGS:
Major intracranial arteries, including the distal internal carotid, middle cerebral, anterior cerebral, vertebral, and basilar arteries demonstrate normal flow-related signal without evidence of significant stenosis, occlusion, or aneurysm.`,
    impression: `IMPRESSION:
Unremarkable MRA of the circle of Willis.`,
  },
  // --- SPINE ---
  {
    studyType: ["ct cervical spine without contrast", "ct c-spine"],
    findings: `FINDINGS:
Vertebral body heights and alignment are maintained. No acute fracture or dislocation is identified.

Intervertebral disc spaces are preserved. No significant prevertebral soft tissue swelling.

Visualized portions of the craniocervical junction are unremarkable.`,
    impression: `IMPRESSION:
No acute fracture or malalignment of the cervical spine.`,
  },
  {
    studyType: ["ct thoracic spine without contrast", "ct t-spine"],
    findings: `FINDINGS:
Vertebral body heights and alignment are maintained. No evidence of acute fracture or dislocation.

Intervertebral disc spaces are preserved. Paraspinal soft tissues are unremarkable.

Visualized portions of the ribs and sternum are intact.`,
    impression: `IMPRESSION:
No acute fracture or malalignment of the thoracic spine.`,
  },
  {
    studyType: ["ct lumbar spine without contrast", "ct l-spine"],
    findings: `FINDINGS:
Vertebral body heights and alignment are maintained. No acute fracture, subluxation, or spondylolysis.

Intervertebral disc spaces are preserved. Facet joints are unremarkable.

Paraspinal soft tissues appear normal.`,
    impression: `IMPRESSION:
No acute osseous abnormality of the lumbar spine.`,
  },
  {
    studyType: ["mri cervical spine without contrast", "mri c-spine"],
    findings: `FINDINGS:
Vertebral body alignment is anatomic. Spinal cord demonstrates normal signal intensity.

Intervertebral discs show normal height and signal, without significant herniation or stenosis. Neural foramina are patent.

Paraspinal soft tissues are unremarkable.`,
    impression: `IMPRESSION:
Unremarkable MRI of the cervical spine.`,
  },
  {
    studyType: ["mri lumbar spine without contrast", "mri l-spine"],
    findings: `FINDINGS:
Normal lumbar lordosis. Vertebral body heights are maintained. Conus medullaris terminates at a normal level and is of normal signal.

Intervertebral discs demonstrate normal T2 signal without evidence of significant disc herniation, spinal canal stenosis, or neural foraminal narrowing.`,
    impression: `IMPRESSION:
Unremarkable MRI of the lumbar spine.`,
  },
  // --- CHEST ---
  {
    studyType: ["chest x-ray pa and lateral", "cxr 2 views", "chest radiograph"],
    findings: `FINDINGS:
Lungs are clear without focal consolidation, pneumothorax, or pleural effusion.

Cardiomediastinal silhouette is within normal limits. Hilar contours are normal.

Visualized osseous structures are intact.`,
    impression: `IMPRESSION:
No acute cardiopulmonary process.`,
  },
  {
    studyType: ["chest x-ray portable", "portable cxr", "ap chest"],
    findings: `FINDINGS:
Portable AP projection. Lungs are clear. No large pneumothorax or pleural effusion.

Cardiac silhouette size is upper limits of normal, stable. Support lines and tubes are in satisfactory position.`,
    impression: `IMPRESSION:
No acute cardiopulmonary process.`,
  },
  {
    studyType: ["ct chest without contrast", "non-contrast chest ct"],
    findings: `FINDINGS:
Lungs are clear without consolidation, nodule, or mass. No pneumothorax or pleural effusion.

Heart is not enlarged. Mediastinum is unremarkable, without lymphadenopathy or mass. Thoracic aorta is normal in caliber.

Visualized upper abdominal organs are unremarkable.`,
    impression: `IMPRESSION:
No acute thoracic abnormality.`,
  },
  {
    studyType: ["ct chest with contrast", "contrast-enhanced chest ct"],
    findings: `FINDINGS:
Pulmonary arteries are patent without evidence of central pulmonary embolism.

Lungs are clear. No pleural effusion or pneumothorax.

Mediastinum and hila are unremarkable without pathologic lymphadenopathy. Thoracic aorta is normal in caliber.`,
    impression: `IMPRESSION:
No evidence of pulmonary embolism. No other acute thoracic abnormality.`,
  },
  {
    studyType: ["ct chest for nodules", "low-dose ct chest screening"],
    findings: `FINDINGS:
Lungs are well-aerated. No dominant or suspicious pulmonary nodule or mass identified. No pleural or pericardial effusion.

Mediastinum is unremarkable.

Limited evaluation of the upper abdomen reveals no gross abnormality.`,
    impression: `IMPRESSION:
No evidence of suspicious pulmonary nodule or lung cancer.`,
  },
  // --- ABDOMEN & PELVIS ---
  {
    studyType: ["ct abdomen pelvis with contrast", "ct ap with contrast"],
    findings: `FINDINGS:
Liver, spleen, pancreas, adrenal glands, and kidneys demonstrate normal enhancement and morphology.

No evidence of bowel obstruction or inflammation. Aorta and IVC are normal in caliber. No free fluid or free air.

Visualized lung bases are clear. Osseous structures are intact.`,
    impression: `IMPRESSION:
No acute intra-abdominal or pelvic process.`,
  },
  {
    studyType: ["ct abdomen pelvis without contrast", "non-contrast ct ap"],
    findings: `FINDINGS:
No high-density renal or ureteral calculi are identified. Liver, spleen, pancreas, and adrenal glands are unremarkable in size and attenuation.

No bowel dilation or wall thickening. No free air or ascites.

Visualized osseous structures are unremarkable.`,
    impression: `IMPRESSION:
No evidence of nephroureterolithiasis or acute bowel pathology.`,
  },
  {
    studyType: ["ct abdomen pelvis for appendicitis", "ct for appendix"],
    findings: `FINDINGS:
Appendix is visualized and normal in caliber without wall thickening or surrounding inflammation. No evidence of bowel obstruction, abscess, or free air.

Liver, spleen, pancreas, kidneys, and adrenal glands are unremarkable.

Visualized lung bases are clear.`,
    impression: `IMPRESSION:
No CT evidence of appendicitis or other acute intra-abdominal process.`,
  },
  {
    studyType: ["ultrasound abdomen complete", "us abdomen"],
    findings: `FINDINGS:
Liver is normal in size and echotexture, without focal lesion. Gallbladder wall is not thickened, and there are no gallstones or pericholecystic fluid. Common bile duct is not dilated.

Pancreas and spleen appear normal. Both kidneys are of normal size and echogenicity without hydronephrosis. Aorta is not aneurysmal.`,
    impression: `IMPRESSION:
Unremarkable ultrasound of the abdomen.`,
  },
  {
    studyType: ["ultrasound renal", "us kidneys"],
    findings: `FINDINGS:
Right and left kidneys are normal in size, position, and echotexture. No evidence of hydronephrosis, calculus, or mass.

Urinary bladder is unremarkable.`,
    impression: `IMPRESSION:
Normal renal ultrasound.`,
  },
  {
    studyType: ["x-ray kub", "abdominal x-ray"],
    findings: `FINDINGS:
Bowel gas pattern is nonspecific. No evidence of high-grade bowel obstruction. No pneumoperitoneum.

No opaque renal or ureteral calculi visualized. Osseous structures are intact.`,
    impression: `IMPRESSION:
Nonspecific bowel gas pattern without evidence of obstruction or pneumoperitoneum.`,
  },
  // --- MSK ---
  {
    studyType: ["x-ray shoulder", "shoulder radiograph"],
    findings: `FINDINGS:
Glenohumeral joint is congruous. No fracture or dislocation is identified. Acromioclavicular joint is unremarkable.

No suspicious osseous lesion or significant degenerative change.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray elbow", "elbow radiograph"],
    findings: `FINDINGS:
Radiocapitellar and ulnohumeral joints are congruous. No fracture or dislocation.

Anterior and posterior fat pads are not elevated, suggesting no effusion. Visualized bones are otherwise unremarkable.`,
    impression: `IMPRESSION:
No acute fracture or dislocation.`,
  },
  {
    studyType: ["x-ray wrist", "wrist radiograph"],
    findings: `FINDINGS:
Carpal bones are normally aligned. No fracture or dislocation.

Radiocarpal and distal radioulnar joints are maintained. Visualized portions of the distal radius and ulna are intact.`,
    impression: `IMPRESSION:
No acute fracture or dislocation.`,
  },
  {
    studyType: ["x-ray hand", "hand radiograph"],
    findings: `FINDINGS:
Carpal bones, metacarpals, and phalanges are intact without evidence of acute fracture or dislocation. Joint spaces are preserved.

No soft tissue swelling or radiopaque foreign body.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray hip", "hip radiograph"],
    findings: `FINDINGS:
Femoral head and acetabulum are congruent. No evidence of acute fracture or dislocation. Joint space is preserved.

No suspicious osseous lesions.`,
    impression: `IMPRESSION:
No acute fracture or dislocation.`,
  },
  {
    studyType: ["x-ray knee", "knee radiograph"],
    findings: `FINDINGS:
Femorotibial and patellofemoral compartments are maintained. No acute fracture or dislocation. No joint effusion.

Visualized bones are otherwise unremarkable.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray ankle", "ankle radiograph"],
    findings: `FINDINGS:
Tibiotalar and subtalar joints are congruous. No fracture of the distal tibia, distal fibula, or talus. Mortise is symmetric.

No significant soft tissue swelling.`,
    impression: `IMPRESSION:
No acute fracture or dislocation.`,
  },
  {
    studyType: ["x-ray foot", "foot radiograph"],
    findings: `FINDINGS:
Tarsals, metatarsals, and phalanges are intact without evidence of acute fracture or dislocation. Joint spaces are preserved.

No radiopaque foreign body identified.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["mri knee without contrast", "non-contrast knee mri"],
    findings: `FINDINGS:
Anterior and posterior cruciate ligaments are intact. Medial and lateral menisci are normal in morphology and signal. Collateral ligaments are intact.

No bone marrow edema to suggest acute fracture. Articular cartilage is preserved. No joint effusion.`,
    impression: `IMPRESSION:
Unremarkable MRI of the knee.`,
  },
  // Add 70 more varied, unique templates
  // --- HEAD & NECK CONTINUED ---
  {
    studyType: ["mri brain with and without contrast", "contrast brain mri"],
    findings: `FINDINGS:
Following administration of intravenous contrast, no evidence of abnormal parenchymal, leptomeningeal, or dural enhancement is present. No acute infarct, hemorrhage, or mass.

Ventricular system and sulci are normal for age. Major intracranial vessels demonstrate normal flow voids.`,
    impression: `IMPRESSION:
No evidence of abnormal intracranial enhancement or other acute pathology.`,
  },
  {
    studyType: ["ct sinuses without contrast", "sinus ct"],
    findings: `FINDINGS:
Paranasal sinuses are well-aerated. Osteomeatal complexes are patent bilaterally. No evidence of sinus mucosal thickening, air-fluid levels, or bony erosion.

Nasal septum is midline.`,
    impression: `IMPRESSION:
No evidence of sinusitis.`,
  },
  {
    studyType: ["mrv head without contrast", "mrv brain"],
    findings: `FINDINGS:
Major dural venous sinuses, including the superior sagittal, transverse, sigmoid, and straight sinuses, are patent and demonstrate normal flow-related signal.

Deep cerebral veins are also unremarkable.`,
    impression: `IMPRESSION:
No evidence of dural venous sinus thrombosis.`,
  },
  {
    studyType: ["ct temporal bones without contrast"],
    findings: `FINDINGS:
External auditory canals are patent. Middle ear cavities and mastoid air cells are well-aerated. Ossicular chains appear intact and in normal configuration.

Cochlea, vestibule, and semicircular canals have a normal appearance.`,
    impression: `IMPRESSION:
Unremarkable CT of the temporal bones.`,
  },
  // --- SPINE CONTINUED ---
  {
    studyType: ["mri thoracic spine without contrast", "mri t-spine"],
    findings: `FINDINGS:
Normal thoracic kyphosis. Vertebral body heights are maintained without fracture.

Thoracic spinal cord is normal in caliber and signal. No significant disc herniation, spinal canal stenosis, or foraminal narrowing.`,
    impression: `IMPRESSION:
Unremarkable MRI of the thoracic spine.`,
  },
  {
    studyType: ["x-ray cervical spine", "c-spine series"],
    findings: `FINDINGS:
Normal cervical lordosis. Vertebral bodies are aligned and intact. Disc spaces are preserved.

No prevertebral soft tissue swelling. Facet joints appear unremarkable.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray thoracic spine", "t-spine series"],
    findings: `FINDINGS:
Normal thoracic kyphosis. Vertebral bodies are intact and aligned. Disc spaces are maintained.

Paraspinal lines are not displaced.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray lumbar spine", "l-spine series"],
    findings: `FINDINGS:
Normal lumbar lordosis. Vertebral body heights and alignment are maintained. Disc spaces are preserved.

Pedicles are intact. No spondylolysis is identified.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  // --- CHEST CONTINUED ---
  {
    studyType: ["x-ray ribs", "rib series"],
    findings: `FINDINGS:
Visualized ribs are intact without evidence of acute fracture.

Lungs are clear. No pneumothorax or pleural effusion is identified.`,
    impression: `IMPRESSION:
No acute rib fracture.`,
  },
  {
    studyType: ["ct angiogram aorta chest", "cta chest aorta"],
    findings: `FINDINGS:
Thoracic aorta is well-opacified and normal in caliber from the root to the diaphragm, without evidence of dissection, intramural hematoma, or aneurysm. Great vessels are patent.

Lungs are clear.`,
    impression: `IMPRESSION:
No evidence of acute aortic syndrome.`,
  },
  // --- ABDOMEN & PELVIS CONTINUED ---
  {
    studyType: ["ultrasound aorta", "us aorta for aaa"],
    findings: `FINDINGS:
Abdominal aorta is visualized from the celiac axis to the bifurcation. Maximum diameter is within normal limits.

No evidence of aneurysm or dissection flap.`,
    impression: `IMPRESSION:
No evidence of abdominal aortic aneurysm.`,
  },
  {
    studyType: ["ultrasound gallbladder", "us ruq", "right upper quadrant ultrasound"],
    findings: `FINDINGS:
Gallbladder is well-distended with a normal wall thickness. No gallstones, sludge, or pericholecystic fluid. Common bile duct is not dilated.

Visualized portions of the liver appear homogeneous.`,
    impression: `IMPRESSION:
No sonographic evidence of acute cholecystitis.`,
  },
  {
    studyType: ["ultrasound pelvis transabdominal", "us pelvis"],
    findings: `FINDINGS:
Uterus is normal in size and echotexture. Endometrial stripe is thin and uniform.

Ovaries are visualized and appear unremarkable, without cysts or masses. No free fluid in the cul-de-sac.`,
    impression: `IMPRESSION:
Unremarkable pelvic ultrasound.`,
  },
  {
    studyType: ["ct urogram with and without contrast", "ct ivp"],
    findings: `FINDINGS:
Non-contrast images show no renal or ureteral calculi. Following contrast administration, symmetric nephrographic enhancement is present.

Collecting systems, ureters, and bladder are opacified and unremarkable on excretory phase imaging, without filling defects or obstruction.`,
    impression: `IMPRESSION:
Normal CT urogram.`,
  },
  {
    studyType: ["mri pelvis without contrast", "non-contrast pelvic mri"],
    findings: `FINDINGS:
Uterus and ovaries are normal in size, shape, and signal intensity. Urinary bladder is unremarkable. No pelvic masses or pathologic fluid collections.

Visualized pelvic musculature and osseous structures are normal.`,
    impression: `IMPRESSION:
Unremarkable MRI of the pelvis.`,
  },
  // --- MSK CONTINUED ---
  {
    studyType: ["mri shoulder without contrast", "non-contrast shoulder mri"],
    findings: `FINDINGS:
Rotator cuff tendons (supraspinatus, infraspinatus, teres minor, subscapularis) are intact without tear or tendinosis. Biceps tendon is normal in position and appearance.

Glenoid labrum is intact. No significant glenohumeral or acromioclavicular joint arthropathy.`,
    impression: `IMPRESSION:
Unremarkable MRI of the shoulder.`,
  },
  {
    studyType: ["mri hip without contrast", "non-contrast hip mri"],
    findings: `FINDINGS:
Femoral head appears viable without evidence of avascular necrosis. Articular cartilage is preserved. Acetabular labrum is intact.

Surrounding muscles and tendons are unremarkable. No significant joint effusion.`,
    impression: `IMPRESSION:
Unremarkable MRI of the hip.`,
  },
  {
    studyType: ["mri ankle without contrast", "non-contrast ankle mri"],
    findings: `FINDINGS:
Major ligaments, including the anterior talofibular, calcaneofibular, and deltoid ligaments, are intact. Tendons are normal without tear or tenosynovitis.

No osteochondral lesion of the talus. No bone marrow edema.`,
    impression: `IMPRESSION:
Unremarkable MRI of the ankle.`,
  },
  {
    studyType: ["x-ray pelvis", "pelvis radiograph"],
    findings: `FINDINGS:
Pelvic ring is intact. Sacroiliac joints and pubic symphysis are unremarkable. Both hip joints appear congruous.

No fractures or suspicious osseous lesions identified.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray clavicle", "clavicle radiograph"],
    findings: `FINDINGS:
Clavicle is intact throughout its length without evidence of fracture or dislocation.

Acromioclavicular and sternoclavicular joints are aligned.`,
    impression: `IMPRESSION:
No acute fracture of the clavicle.`,
  },
  // --- VASCULAR ---
  {
    studyType: ["ultrasound carotid duplex", "carotid doppler"],
    findings: `FINDINGS:
Common, internal, and external carotid arteries are patent bilaterally with normal Doppler waveforms. No hemodynamically significant stenosis or plaque is identified.

Vertebral artery flow is antegrade.`,
    impression: `IMPRESSION:
No evidence of hemodynamically significant carotid artery stenosis.`,
  },
  {
    studyType: ["ultrasound lower extremity venous duplex for dvt", "venous doppler leg"],
    findings: `FINDINGS:
Common femoral, femoral, and popliteal veins are patent and show normal compressibility and respiratory phasicity.

No evidence of deep vein thrombosis in the examined segments.`,
    impression: `IMPRESSION:
No sonographic evidence of acute deep vein thrombosis in the lower extremity.`,
  },
  {
    studyType: ["ultrasound upper extremity venous duplex for dvt", "venous doppler arm"],
    findings: `FINDINGS:
Internal jugular, subclavian, axillary, brachial, and basilic veins are patent and compressible.

No evidence of acute deep vein thrombosis in the visualized segments.`,
    impression: `IMPRESSION:
No sonographic evidence of acute deep vein thrombosis in the upper extremity.`,
  },
  {
    studyType: ["ct angiogram head", "cta head"],
    findings: `FINDINGS:
Major intracranial arteries are well-opacified. No evidence of large vessel occlusion, significant stenosis, aneurysm, or vascular malformation.

Symmetric enhancement of the cerebral hemispheres.`,
    impression: `IMPRESSION:
No CT angiographic evidence of large vessel occlusion or aneurysm.`,
  },
  {
    studyType: ["ct angiogram neck", "cta neck"],
    findings: `FINDINGS:
Common, internal, and external carotid arteries are patent from the aortic arch to the skull base without significant stenosis, dissection, or plaque.

Vertebral arteries are also patent.`,
    impression: `IMPRESSION:
No significant stenosis or dissection of the cervical carotid or vertebral arteries.`,
  },
  // --- PEDIATRIC ---
  {
    studyType: ["x-ray pediatric chest", "pediatric cxr"],
    findings: `FINDINGS:
Lungs are well-aerated without focal consolidation. Cardiothymic silhouette is normal for age. No pneumothorax or pleural effusion.

Visualized osseous structures are unremarkable.`,
    impression: `IMPRESSION:
No acute cardiopulmonary process.`,
  },
  {
    studyType: ["ultrasound pediatric pylorus", "pyloric stenosis ultrasound"],
    findings: `FINDINGS:
Pyloric muscle thickness and channel length are within normal limits for age.

Normal passage of gastric contents through the pylorus was observed during the examination.`,
    impression: `IMPRESSION:
No sonographic evidence of pyloric stenosis.`,
  },
  {
    studyType: ["ultrasound pediatric hip", "hip ultrasound for ddh"],
    findings: `FINDINGS:
Both hips demonstrate normal morphology and stability with stress maneuvers. Femoral head is adequately covered by the acetabulum.

Alpha angles are within normal limits.`,
    impression: `IMPRESSION:
No sonographic evidence of developmental dysplasia of the hip.`,
  },
  {
    studyType: ["x-ray bone age", "bone age study"],
    findings: `FINDINGS:
Ossification centers of the left hand and wrist are compared with the Greulich and Pyle standards.

Skeletal maturity is consistent with the patient's chronological age.`,
    impression: `IMPRESSION:
Bone age is concordant with chronological age.`,
  },
  {
    studyType: ["x-ray soft tissue neck lateral", "lateral neck for airway"],
    findings: `FINDINGS:
Airway is patent from the nasopharynx to the subglottis. Epiglottis and aryepiglottic folds are thin. Retropharyngeal soft tissues are not thickened.

No radiopaque foreign body is seen.`,
    impression: `IMPRESSION:
No radiographic evidence of epiglottitis or significant airway obstruction.`,
  },
  // --- WOMEN'S IMAGING ---
  {
    studyType: ["mammogram screening", "screening mammography"],
    findings: `FINDINGS:
Scattered areas of fibroglandular density are present.

No suspicious masses, architectural distortion, or microcalcifications are identified.`,
    impression: `IMPRESSION:
Negative screening mammogram. Recommend routine screening interval. BI-RADS Category 1: Negative.`,
  },
  {
    studyType: ["ultrasound breast", "breast sonogram"],
    findings: `FINDINGS:
Targeted ultrasound of the area of concern demonstrates normal fibroglandular tissue without a discrete solid mass or suspicious cyst.`,
    impression: `IMPRESSION:
No sonographic evidence of malignancy in the area of concern. BI-RADS Category 1: Negative.`,
  },
  {
    studyType: ["ultrasound pelvis transvaginal", "tvus"],
    findings: `FINDINGS:
Uterus is anteverted and normal in size and myometrial echotexture. Endometrium is thin and homogeneous.

Both ovaries are visualized and contain small physiologic follicles, normal for premenopausal status. No adnexal masses. No free fluid.`,
    impression: `IMPRESSION:
Unremarkable transvaginal pelvic ultrasound.`,
  },
  {
    studyType: ["hysterosalpingogram", "hsg"],
    findings: `FINDINGS:
Uterine cavity is normal in size and contour, without filling defects.

Both fallopian tubes are opacified throughout their length, with free spillage of contrast into the peritoneal cavity, indicating patency.`,
    impression: `IMPRESSION:
Normal uterine cavity and bilateral fallopian tube patency.`,
  },
  {
    studyType: ["mri pelvis for fibroids", "mri uterus"],
    findings: `FINDINGS:
Uterus is of normal size and contains no discrete fibroids. Junctional zone is normal in thickness. Endometrium is uniform.

Ovaries are unremarkable. No other pelvic pathology is seen.`,
    impression: `IMPRESSION:
Unremarkable pelvic MRI; no evidence of uterine fibroids.`,
  },
  // --- MISCELLANEOUS ---
  {
    studyType: ["x-ray abdomen 1 view", "flat plate abdomen"],
    findings: `FINDINGS:
Supine view shows a nonspecific bowel gas pattern. No dilated loops of small bowel. Stool is present in the colon. No pneumoperitoneum.

Osseous structures are unremarkable.`,
    impression: `IMPRESSION:
Nonspecific bowel gas pattern.`,
  },
  {
    studyType: ["x-ray femur", "femur radiograph"],
    findings: `FINDINGS:
Visualized portions of the femur, from the hip to the knee, are intact. No acute fracture, dislocation, or destructive osseous lesion.

Soft tissues are unremarkable.`,
    impression: `IMPRESSION:
No acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray tibia and fibula", "tib/fib radiograph"],
    findings: `FINDINGS:
Tibia and fibula are intact throughout their length. No evidence of acute fracture or dislocation.

Knee and ankle joints are grossly aligned.`,
    impression: `IMPRESSION:
No acute fracture.`,
  },
  {
    studyType: ["x-ray humerus", "humerus radiograph"],
    findings: `FINDINGS:
Humerus is intact from the shoulder to the elbow. No acute fracture or dislocation.

Soft tissues are unremarkable. No suspicious osseous lesion.`,
    impression: `IMPRESSION:
No acute fracture.`,
  },
  {
    studyType: ["x-ray forearm", "radius and ulna radiograph"],
    findings: `FINDINGS:
Radius and ulna are intact. No acute fracture or dislocation. Wrist and elbow joints are grossly aligned.

No significant soft tissue swelling.`,
    impression: `IMPRESSION:
No acute fracture.`,
  },
  {
    studyType: ["ct renal stone protocol", "ct kidney stone"],
    findings: `FINDINGS:
Non-contrast helical CT of the abdomen and pelvis was performed. No calcifications are seen along the expected course of the ureters.

Kidneys are normal in size and position without hydronephrosis. Urinary bladder is unremarkable. No appendicitis or diverticulitis.`,
    impression: `IMPRESSION:
No evidence of obstructing urinary tract calculus.`,
  },
  {
    studyType: ["ct angiogram abdomen pelvis", "cta ap runoff"],
    findings: `FINDINGS:
Abdominal aorta and its major branches, including the celiac, SMA, and renal arteries, are patent without significant stenosis. Iliac and femoral arteries are patent bilaterally.

Solid organs are unremarkable. No evidence of bowel ischemia.`,
    impression: `IMPRESSION:
Patent abdominal aorta and major branch vessels.`,
  },
  {
    studyType: ["ultrasound thyroid", "thyroid sonogram"],
    findings: `FINDINGS:
Right and left lobes of the thyroid gland are normal in size and echotexture. No discrete nodules or cysts are identified.

Isthmus is unremarkable. No cervical lymphadenopathy.`,
    impression: `IMPRESSION:
Normal thyroid ultrasound.`,
  },
  {
    studyType: ["ultrasound scrotum", "scrotal doppler"],
    findings: `FINDINGS:
Both testes are symmetric in size and echotexture. Normal arterial and venous flow is demonstrated bilaterally. No evidence of hydrocele, varicocele, or testicular mass.

Epididymides are unremarkable.`,
    impression: `IMPRESSION:
Normal bilateral scrotal ultrasound without evidence of torsion or mass.`,
  },
  {
    studyType: ["x-ray skull", "skull series"],
    findings: `FINDINGS:
Cranial vault is intact. No fractures are identified. Sutures are normal for age.

Sella turcica appears normal. No abnormal intracranial calcifications.`,
    impression: `IMPRESSION:
No evidence of skull fracture.`,
  },
  {
    studyType: ["ct abdomen without contrast"],
    findings: `FINDINGS:
Liver, spleen, pancreas, adrenal glands, and kidneys are unremarkable in size and attenuation. No bowel dilation.

No evidence of free air or significant fluid collection. Abdominal aorta is not aneurysmal.`,
    impression: `IMPRESSION:
Unremarkable non-contrast CT of the abdomen.`,
  },
  {
    studyType: ["ct pelvis without contrast"],
    findings: `FINDINGS:
Urinary bladder is unremarkable. Pelvic organs are normal in appearance for the patient's age and gender. No evidence of pelvic mass or fluid collection.

Visualized bowel loops are normal in caliber. Pelvic bones are intact.`,
    impression: `IMPRESSION:
Unremarkable non-contrast CT of the pelvis.`,
  },
  {
    studyType: ["mri abdomen without contrast"],
    findings: `FINDINGS:
Liver, spleen, pancreas, kidneys, and adrenal glands demonstrate normal signal intensity without focal lesions. Biliary tree is not dilated.

Major abdominal vessels are patent. No ascites or lymphadenopathy.`,
    impression: `IMPRESSION:
Unremarkable non-contrast MRI of the abdomen.`,
  },
  {
    studyType: ["mri abdomen with and without contrast", "mri liver"],
    findings: `FINDINGS:
Liver demonstrates homogeneous signal intensity and normal enhancement pattern after contrast administration. No suspicious enhancing lesions.

Spleen, pancreas, and kidneys are also unremarkable. Portal vein is patent.`,
    impression: `IMPRESSION:
Unremarkable MRI of the abdomen, no evidence of hepatic mass.`,
  },
  {
    studyType: ["mr cholangiopancreatography", "mrcp"],
    findings: `FINDINGS:
Common bile duct, common hepatic duct, and intrahepatic biliary ducts are not dilated. Pancreatic duct is normal in caliber.

Gallbladder is unremarkable. No filling defects are identified.`,
    impression: `IMPRESSION:
Normal MRCP.`,
  },
  // Add another 35 templates to reach 100 total
  {
    studyType: ["x-ray nasal bones", "nasal bone series"],
    findings: `FINDINGS:
Nasal bones are intact without evidence of acute, displaced fracture. Nasal septum appears midline.

Soft tissues are unremarkable.`,
    impression: `IMPRESSION:
No acute fracture of the nasal bones.`,
  },
  {
    studyType: ["x-ray mandible", "mandible series"],
    findings: `FINDINGS:
Mandible is intact, including the condyles, rami, angles, and body. No fracture or dislocation is identified.

Temporomandibular joints appear congruous.`,
    impression: `IMPRESSION:
No acute fracture of the mandible.`,
  },
  {
    studyType: ["ct facial bones without contrast", "ct face"],
    findings: `FINDINGS:
Visualized facial bones, including the zygomatic arches, maxillary sinuses, and orbital rims, are intact. No evidence of acute fracture.

Paranasal sinuses are clear.`,
    impression: `IMPRESSION:
No acute facial fracture.`,
  },
  {
    studyType: ["x-ray sacroiliac joints", "si joint films"],
    findings: `FINDINGS:
Sacroiliac joints are symmetric with smooth articular surfaces and normal joint space width.

No evidence of sclerosis, erosion, or ankylosis.`,
    impression: `IMPRESSION:
Unremarkable sacroiliac joints.`,
  },
  {
    studyType: ["x-ray sternum", "sternum radiograph"],
    findings: `FINDINGS:
Lateral and oblique views of the sternum demonstrate no evidence of acute fracture or dislocation.

Sternoclavicular joints are aligned.`,
    impression: `IMPRESSION:
No acute sternal fracture.`,
  },
  {
    studyType: ["barium swallow", "esophagram"],
    findings: `FINDINGS:
Esophagus is normal in course and caliber. Mucosal folds are normal. No evidence of stricture, ulceration, filling defect, or extrinsic compression.

Normal swallowing mechanics are observed.`,
    impression: `IMPRESSION:
Normal single-contrast esophagram.`,
  },
  {
    studyType: ["upper gi series", "ugi"],
    findings: `FINDINGS:
Esophagus, stomach, and duodenal bulb are unremarkable.

No evidence of hiatal hernia, ulcer, mass, or significant reflux.`,
    impression: `IMPRESSION:
Normal upper GI series.`,
  },
  {
    studyType: ["small bowel follow-through", "sbft"],
    findings: `FINDINGS:
Oral contrast opacifies the small bowel, reaching the colon in a normal transit time.

Small bowel loops are normal in caliber without evidence of stricture, filling defect, or inflammatory change.`,
    impression: `IMPRESSION:
Normal small bowel follow-through.`,
  },
  {
    studyType: ["ct enterography", "cte"],
    findings: `FINDINGS:
Small bowel is well-distended with neutral oral contrast. Mural thickness and enhancement are normal. No evidence of stricture, inflammation, or fistula.

Mesentery is unremarkable. Other solid organs appear normal.`,
    impression: `IMPRESSION:
No CT evidence of active small bowel inflammation.`,
  },
  {
    studyType: ["virtual colonoscopy", "ct colonography"],
    findings: `FINDINGS:
2D and 3D evaluation of the cleansed and distended colon reveals no polyps or masses meeting the size criteria for reporting.

Extracolonic structures are unremarkable.`,
    impression: `IMPRESSION:
Negative CT colonography screening examination.`,
  },
  {
    studyType: ["fistulogram"],
    findings: `FINDINGS:
Contrast injected into the cutaneous opening of the fistula tract demonstrates a simple, unbranched tract that terminates blindly without communication to bowel or other structures.`,
    impression: `IMPRESSION:
Simple, blind-ending subcutaneous fistula tract.`,
  },
  {
    studyType: ["loopogram"],
    findings: `FINDINGS:
Contrast administered via the stoma fills the ileal conduit, which is of normal caliber. No evidence of obstruction, leak, or filling defects.

Reflux into the native ureters is not seen.`,
    impression: `IMPRESSION:
Unremarkable loopogram.`,
  },
  {
    studyType: ["ct cystogram"],
    findings: `FINDINGS:
Urinary bladder is well-distended with contrast.

No evidence of extraluminal contrast extravasation to suggest bladder injury or leak.`,
    impression: `IMPRESSION:
No evidence of bladder rupture.`,
  },
  {
    studyType: ["ultrasound appendix", "appendix sonogram"],
    findings: `FINDINGS:
Graded compression ultrasound of the right lower quadrant does not identify a dilated, non-compressible appendix.

No appendicolith or periappendiceal fluid collection is seen.`,
    impression: `IMPRESSION:
Normal appendix not definitely visualized; no secondary sonographic signs of appendicitis.`,
  },
  {
    studyType: ["ultrasound liver with doppler", "liver duplex"],
    findings: `FINDINGS:
Liver is normal in size and echotexture. Hepatic and portal venous flow are antegrade and phasic. Hepatic artery waveform is normal.

No ascites.`,
    impression: `IMPRESSION:
Normal hepatic Doppler ultrasound.`,
  },
  {
    studyType: ["ultrasound renal transplant", "transplant kidney ultrasound"],
    findings: `FINDINGS:
Renal transplant in the right iliac fossa is normal in size and echotexture without hydronephrosis.

Doppler evaluation shows patent renal artery and vein with normal resistive indices.`,
    impression: `IMPRESSION:
Unremarkable renal transplant ultrasound.`,
  },
  {
    studyType: ["arthrogram shoulder mri", "mr arthrogram shoulder"],
    findings: `FINDINGS:
Intra-articular contrast distends the glenohumeral joint.

Glenoid labrum, rotator cuff tendons, and biceps anchor appear intact without contrast extension to suggest a tear.`,
    impression: `IMPRESSION:
No evidence of labral or rotator cuff tear.`,
  },
  {
    studyType: ["arthrogram hip mri", "mr arthrogram hip"],
    findings: `FINDINGS:
Acetabular labrum is sharply defined and appears intact, without abnormal extension of intra-articular contrast. Articular cartilage is smooth.

No evidence of femoroacetabular impingement morphology.`,
    impression: `IMPRESSION:
No evidence of acetabular labral tear.`,
  },
  {
    studyType: ["x-ray weight-bearing knees", "standing knee x-ray"],
    findings: `FINDINGS:
Standing AP views show symmetric joint space in the medial and lateral femorotibial compartments bilaterally. No acute fracture.

Patellofemoral joints are unremarkable.`,
    impression: `IMPRESSION:
No significant osteoarthritis or acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray weight-bearing feet", "standing foot x-ray"],
    findings: `FINDINGS:
Normal alignment of the tarsal and metatarsal bones. Longitudinal arch is maintained.

No fracture, dislocation, or significant degenerative changes.`,
    impression: `IMPRESSION:
Normal alignment; no acute osseous abnormality.`,
  },
  {
    studyType: ["x-ray ac joints", "acromioclavicular joint series"],
    findings: `FINDINGS:
Comparison views of the AC joints with and without weights demonstrate normal alignment. Coracoclavicular distance is symmetric.

No fracture or dislocation.`,
    impression: `IMPRESSION:
No evidence of acromioclavicular separation.`,
  },
  {
    studyType: ["x-ray thoracic inlet", "thoracic outlet views"],
    findings: `FINDINGS:
Cervical ribs are not present. Clavicles and first ribs have a normal appearance.

No osseous abnormality to account for thoracic outlet syndrome is identified.`,
    impression: `IMPRESSION:
No osseous abnormality to suggest thoracic outlet syndrome.`,
  },
  {
    studyType: ["ct angiogram pulmonary arteries", "ct pe study"],
    findings: `FINDINGS:
Contrast opacification of the pulmonary arteries is excellent. Main, lobar, and segmental pulmonary arteries are patent without evidence of filling defects to suggest pulmonary embolism.

Lungs are clear.`,
    impression: `IMPRESSION:
No evidence of pulmonary embolism.`,
  },
  {
    studyType: ["pet/ct whole body", "fdg pet/ct"],
    findings: `FINDINGS:
Physiologic FDG uptake is present in the brain, myocardium, and urinary system. No abnormal focal hypermetabolism is identified to suggest malignancy.

Diagnostic CT component is unremarkable.`,
    impression: `IMPRESSION:
No PET evidence of hypermetabolic malignancy.`,
  },
  {
    studyType: ["nuclear medicine bone scan", "bone scintigraphy"],
    findings: `FINDINGS:
Whole-body planar and SPECT images demonstrate symmetric and uniform radiotracer uptake throughout the skeleton.

No focal areas of abnormal uptake to suggest metastatic disease or fracture.`,
    impression: `IMPRESSION:
No scintigraphic evidence of osseous metastatic disease.`,
  },
  {
    studyType: ["nuclear medicine v/q scan", "ventilation/perfusion scan"],
    findings: `FINDINGS:
Ventilation and perfusion images demonstrate homogeneous distribution of radiotracer throughout both lungs.

No mismatched perfusion defects are seen.`,
    impression: `IMPRESSION:
Low probability of pulmonary embolism.`,
  },
  {
    studyType: ["nuclear medicine hida scan", "hepatobiliary scan"],
    findings: `FINDINGS:
Radiotracer is promptly extracted by the liver and excreted into the biliary tree.

Gallbladder, common bile duct, and small bowel are visualized within 60 minutes, indicating cystic and common duct patency.`,
    impression: `IMPRESSION:
Normal hepatobiliary scan, no evidence of acute cholecystitis or biliary obstruction.`,
  },
  {
    studyType: ["nuclear medicine gastric emptying study"],
    findings: `FINDINGS:
Percentage of radiolabeled meal remaining in the stomach at 1, 2, and 4 hours is within normal limits.`,
    impression: `IMPRESSION:
Normal solid-phase gastric emptying.`,
  },
  {
    studyType: ["obstetric ultrasound first trimester", "ob us first trimester"],
    findings: `FINDINGS:
Single live intrauterine pregnancy is identified. Crown-rump length is consistent with a gestational age of [e.g., 9 weeks 2 days].

Cardiac activity is present and normal.`,
    impression: `IMPRESSION:
Live intrauterine pregnancy, consistent with dates.`,
  },
  {
    studyType: ["obstetric ultrasound anatomy scan", "ob us second trimester"],
    findings: `FINDINGS:
Single live fetus is seen in cephalic presentation. Fetal anatomy survey is grossly unremarkable. Biometric parameters are consistent with the estimated gestational age. Amniotic fluid volume and placenta appear normal.`,
    impression: `IMPRESSION:
Anatomically unremarkable single live intrauterine pregnancy.`,
  },
  {
    studyType: ["biophysical profile", "bpp"],
    findings: `FINDINGS:
Fetal tone, breathing, movement, and amniotic fluid volume are all normal. Biophysical profile score is 8/8.`,
    impression: `IMPRESSION:
Normal biophysical profile, score 8/8, reassuring for fetal well-being.`,
  },
  {
    studyType: ["fluoroscopy swallow study", "modified barium swallow"],
    findings: `FINDINGS:
Oral, pharyngeal, and esophageal phases of swallowing are evaluated with various consistencies. No evidence of laryngeal penetration or aspiration. Pharyngeal and esophageal motility are normal.`,
    impression: `IMPRESSION:
Normal oropharyngeal swallow function without penetration or aspiration.`,
  },
  {
    studyType: ["ct angiogram circle of willis", "cta cow"],
    findings: `FINDINGS:
Anterior and posterior cerebral circulations are well-opacified. Circle of Willis is patent and complete. No evidence of aneurysm, stenosis, or occlusion.`,
    impression: `IMPRESSION:
Unremarkable CT angiography of the Circle of Willis.`,
  },
  {
    studyType: ["mri temporomandibular joints", "tmj mri"],
    findings: `FINDINGS:
In both open and closed mouth positions, articular discs of both TMJs are in normal position relative to the mandibular condyles. No evidence of joint effusion or osseous abnormality.`,
    impression: `IMPRESSION:
Normal bilateral TMJ MRI.`,
  },
  {
    studyType: ["ct angiogram coronary arteries", "ccta"],
    findings: `FINDINGS:
Left main, left anterior descending, circumflex, and right coronary arteries are patent without evidence of significant stenosis or calcified plaque. Coronary artery dominance is right-dominant.`,
    impression: `IMPRESSION:
No CT evidence of significant coronary artery disease.`,
  },
];

/**
 * A generic fallback template for when no specific match is found.
 */
export const GENERIC_NORMAL_TEMPLATE: ReportTemplate = {
  studyType: ["generic fallback"],
  findings: `FINDINGS:
Visualized structures are unremarkable. No evidence of acute pathology is identified.`,
  impression: `IMPRESSION:
Unremarkable examination.`,
};

/**
 * Finds a report template that matches the given study type.
 * The search is case-insensitive and checks against a list of aliases for each template.
 * @param studyTypeValue The study type string to search for.
 * @returns A matching ReportTemplate or null if no match is found.
 */
export const findTemplateForStudy = (
  studyTypeValue: string | null | undefined
): ReportTemplate | null => {
  if (!studyTypeValue) {
    return null;
  }
  const lowerCaseStudyType = studyTypeValue.toLowerCase().trim();

  for (const template of REPORT_TEMPLATES) {
    for (const alias of template.studyType) {
      if (alias.toLowerCase() === lowerCaseStudyType) {
        return template;
      }
    }
  }
  return null;
};
