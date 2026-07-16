import { Exercise } from '../types';

export const EXERCISES_DB: Record<string, Exercise> = {
  jumping_jacks: {
    id: 'jumping_jacks',
    nameAr: 'تمارين القفز والتباعد (جامبنج جاكس)',
    nameEn: 'Jumping Jacks',
    description: 'تمرين تنشيطي لكامل الجسم يساعد في حرق الدهون وتهيئة الدورة الدموية.',
    duration: 30,
    caloriesPerMin: 10,
    animationType: 'jumping-jacks',
    steps: [
      'قف بقامة مستقيمة مع ضم القدمين ووضع الذراعين بجانب الجسم.',
      'اقفز مباعداً بين قدميك ومرفعاً ذراعيك فوق رأسك في آن واحد.',
      'اقفز مرة أخرى للعودة إلى وضع البداية.',
      'كرر الحركة بشكل متواصل وسريع.'
    ],
    tips: [
      'حافظ على هبوط ناعم على أطراف قدميك لتجنب إجهاد الركبة.',
      'ابقِ ذراعيك مشدودتين قليلاً أثناء الرفع.'
    ],
    muscleGroup: 'كامل الجسم',
    difficulty: 'مبتدئ',
    videoUrl: 'https://www.youtube.com/embed/iSSAk4Xg5_g',
    mp4Url: 'https://a.top4top.io/m_3847ao6wf1.mp4'
  },
  squats: {
    id: 'squats',
    nameAr: 'تمرين القرفصاء (السكوات)',
    nameEn: 'Squats',
    description: 'تمرين قوي لشد عضلات الفخذين والأرداف والبطن السفلي وتحسين التوازن.',
    duration: 40,
    caloriesPerMin: 8,
    animationType: 'squats',
    steps: [
      'قف مع مباعدة قدميك بعرض الكتفين مع توجيه أصابع القدم للأمام قليلاً.',
      'مد ذراعيك أمامك بشكل مستقيم للتوازن.',
      'انزل ببطء وكأنك تجلس على كرسي غير مرئي، مع دفع المؤخرة للخلف وثني الركبتين.',
      'حافظ على استقامة الظهر وعلو الصدر، مع عدم تجاوز ركبتيك لمستوى أصابع قدميك.',
      'ادفع بقدميك للعودة لوضعية الوقوف.'
    ],
    tips: [
      'ركز على دفع وزن جسمك عبر كعبيك وليس أصابع قدميك.',
      'لا تدع ركبتيك تتقاربان للداخل أثناء النزول.'
    ],
    muscleGroup: 'الجزء السفلي والفخذين',
    difficulty: 'متوسط',
    videoUrl: 'https://www.youtube.com/embed/UXJrBgI2RxA',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-squats-with-dumbbells-43030-large.mp4'
  },
  crunches: {
    id: 'crunches',
    nameAr: 'طحن البطن الكلاسيكي (كرانشيز)',
    nameEn: 'Abdominal Crunches',
    description: 'التمرين الذهبي لشد وحرق الدهون من الجزء العلوي لعضلات البطن.',
    duration: 30,
    caloriesPerMin: 6,
    animationType: 'crunches',
    steps: [
      'استلقِ على ظهرك مع ثني ركبتيك ووضع قدميك منبسطتين على الأرض.',
      'ضع أطراف أصابعك خلف أذنيك أو متقاطعتين على صدرك.',
      'ارفع كتفيك وأعلى ظهرك عن الأرض ببطء باستخدام عضلات بطنك فقط.',
      'ازفر الهواء أثناء الصعود واثبت لثانية في الأعلى لمزيد من الضغط.',
      'انزل ببطء للعودة إلى الأرض مع أخذ شهيق.'
    ],
    tips: [
      'لا تسحب رقبتك بيديك للأمام؛ القوة يجب أن تنبع من عضلات البطن.',
      'أبقِ نظرك متجهاً للأعلى لمنع إجهاد الرقبة.'
    ],
    muscleGroup: 'عضلات البطن والخصر',
    difficulty: 'مبتدئ',
    videoUrl: 'https://www.youtube.com/embed/Xyd_fa5zoEU',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-crunches-at-home-43032-large.mp4'
  },
  russian_twist: {
    id: 'russian_twist',
    nameAr: 'الالتواء الروسي (روسيان تويست)',
    nameEn: 'Russian Twist',
    description: 'تمرين ممتاز يستهدف عضلات الخصر والبطن الجانبية لنحت الخصر وإزالة الزوائد.',
    duration: 30,
    caloriesPerMin: 7,
    animationType: 'russian-twist',
    steps: [
      'اجلس على الأرض مع ثني ركبتيك وقدميك مرفوعتين قليلاً عن الأرض.',
      'امل بظهرك للخلف بزاوية 45 درجة لتشعر بضغط في عضلات البطن.',
      'امسك يديك معاً أمام صدرك.',
      'ادر جذعك ويديك ببطء إلى الجانب الأيمن، ثم عد للمنتصف وأدرهما إلى الجانب الأيسر.',
      'حافظ على ثبات الساقين قدر الإمكان أثناء الحركة.'
    ],
    tips: [
      'حافظ على استقامة عمودك الفقري ولا تحنِ ظهرك.',
      'لتقليل الصعوبة، يمكنك وضع كعبي قدميك على الأرض.'
    ],
    muscleGroup: 'عضلات البطن والخصر',
    difficulty: 'متوسط',
    videoUrl: 'https://www.youtube.com/embed/wkD8rjkodUI',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-seated-twists-on-yoga-mat-43035-large.mp4'
  },
  plank: {
    id: 'plank',
    nameAr: 'تمرين الثبات (البلانك الكلاسيكي)',
    nameEn: 'Classic Plank',
    description: 'تمرين جبار لتقوية العضلات العميقة للبطن والظهر (الكور) وشد الجسم بالكامل.',
    duration: 45,
    caloriesPerMin: 5,
    animationType: 'plank',
    steps: [
      'وضع ساعديك على الأرض مباشرة تحت كتفيك بحيث يكون ذراعاك متوازيين.',
      'امتد بجسمك للخلف مستنداً على أصابع قدميك.',
      'اجعل جسمك يشكل خطاً مستقيماً من رأسك حتى كعبيك.',
      'اشدد عضلات بطنك ومؤخرتك لكي لا يهبط حوضك للأسفل.',
      'اثبت في هذه الوضعية وتنفس بشكل طبيعي هادئ.'
    ],
    tips: [
      'لا تدع حوضك يرتفع للأعلى أو يهبط للأسفل.',
      'حافظ على استقامة رقبتك بالنظر إلى نقطة على الأرض على بعد 30 سم أمامك.'
    ],
    muscleGroup: 'عضلات البطن والخصر',
    difficulty: 'متوسط',
    videoUrl: 'https://www.youtube.com/embed/pSHjTRCQxIw',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-plank-position-at-the-gym-43034-large.mp4'
  },
  leg_raises: {
    id: 'leg_raises',
    nameAr: 'رفع الساقين (ليج ريزس)',
    nameEn: 'Leg Raises',
    description: 'تمرين عالي الكفاءة يركز بشكل كامل على حرق دهون البطن السفلي وشد ترهلاتها.',
    duration: 30,
    caloriesPerMin: 7,
    animationType: 'leg-raises',
    steps: [
      'استلقِ منبسطاً على ظهرك وضع يديك تحت كعبي حوضك لدعم أسفل الظهر.',
      'أبقِ ساقيك مستقيمتين ومضمومتين معاً.',
      'ارفع ساقيك ببطء للأعلى حتى تصبحا بزاوية 90 درجة مع الأرض.',
      'انزل بساقيك ببطء شديد نحو الأرض دون أن تلمساها.',
      'كرر الصعود والنزول بتركيز شديد.'
    ],
    tips: [
      'اضغط بأسفل ظهرك على الأرض طوال التمرين لمنع آلام الظهر.',
      'إذا كان التمرين صعباً جداً، يمكنك ثني الركبتين قليلاً.'
    ],
    muscleGroup: 'عضلات البطن والخصر',
    difficulty: 'متقدم',
    videoUrl: 'https://www.youtube.com/embed/l4kQd9eWclE',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-leg-raises-on-a-mat-43036-large.mp4'
  },
  cobra_stretch: {
    id: 'cobra_stretch',
    nameAr: 'تمدد الكوبرا لراحة الظهر والبطن',
    nameEn: 'Cobra Stretch',
    description: 'تمرين إطالة مريح يساهم في إراحة عضلات البطن المشدودة وأسفل الظهر بعد التمرين.',
    duration: 30,
    caloriesPerMin: 3,
    animationType: 'cobra-stretch',
    steps: [
      'استلقِ على بطنك مع وضع كفيك على الأرض تحت كتفيك مباشرة.',
      'أبقِ كوعيك ملتصقين بجسمك.',
      'اضغط براحتيك لترفع صدرك وأعلى بطنك عن الأرض ببطء بمد ذراعيك.',
      'امل برأسك للخلف قليلاً وافتح صدرك للتنفس بعمق.',
      'حافظ على منطقة الحوض ملتصقة بالأرض.'
    ],
    tips: [
      'لا تضغط بشدة لدرجة تؤلم ظهرك؛ تمدد حتى تشعر براحة فقط.',
      'حافظ على كتفيك لأسفل بعيداً عن أذنيك.'
    ],
    muscleGroup: 'الإطالات والاستشفاء',
    difficulty: 'مبتدئ',
    videoUrl: 'https://www.youtube.com/embed/JDzd7ZpG_K0',
    mp4Url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-doing-cobra-stretch-at-the-gym-43037-large.mp4'
  }
};
