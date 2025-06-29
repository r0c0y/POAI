// Exercise and Therapy Service with Video/Image Guides
interface Exercise {
  id: string;
  name: string;
  description: string;
  category: 'mobility' | 'strength' | 'flexibility' | 'balance' | 'cardio';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  repetitions?: number;
  sets?: number;
  instructions: string[];
  precautions: string[];
  benefits: string[];
  images: string[];
  videoUrl?: string;
  voiceInstructions: string[];
  surgeryTypes: string[]; // Which surgeries this exercise is good for
  recoveryPhase: 'immediate' | 'early' | 'intermediate' | 'advanced';
}

interface ExerciseSession {
  id: string;
  patientId: string;
  exercises: Exercise[];
  startTime: Date;
  endTime?: Date;
  completedExercises: string[];
  painLevelBefore?: number;
  painLevelAfter?: number;
  notes: string;
  adherenceScore: number; // 0-100%
}

interface ExerciseProgress {
  exerciseId: string;
  completionDates: Date[];
  averagePainLevel: number;
  improvementScore: number;
  consistency: number; // 0-100%
}

class ExerciseService {
  private exercises: Map<string, Exercise> = new Map();
  private exerciseDatabase: Exercise[] = [];

  constructor() {
    this.initializeExerciseDatabase();
  }

  private initializeExerciseDatabase() {
    // Comprehensive exercise database for post-operative care
    this.exerciseDatabase = [
      // Knee Replacement Exercises
      {
        id: 'knee-ankle-pumps',
        name: 'Ankle Pumps',
        description: 'Gentle ankle movements to improve circulation and prevent blood clots',
        category: 'mobility',
        difficulty: 'beginner',
        duration: 5,
        repetitions: 20,
        sets: 3,
        instructions: [
          'Lie down comfortably with legs extended',
          'Point your toes away from you, then flex them back toward you',
          'Hold for 2 seconds in each position',
          'Repeat slowly and smoothly'
        ],
        precautions: [
          'Stop if you experience severe pain',
          'Move slowly and controlled',
          'Do not force the movement'
        ],
        benefits: [
          'Improves blood circulation',
          'Prevents blood clots',
          'Maintains ankle flexibility',
          'Reduces swelling'
        ],
        images: [
          'https://via.placeholder.com/150/FF0000/FFFFFF?text=Ankle+Pumps+1',
          'https://via.placeholder.com/150/0000FF/FFFFFF?text=Ankle+Pumps+2'
        ],
        videoUrl: 'https://www.youtube.com/embed/Y2g700-y_1Q', // Placeholder YouTube URL
        voiceInstructions: [
          'Start by lying down comfortably',
          'Point your toes away from your body',
          'Now flex your toes back toward you',
          'Hold for two seconds',
          'Repeat this movement twenty times'
        ],
        surgeryTypes: ['knee-replacement', 'hip-replacement', 'ankle-surgery'],
        recoveryPhase: 'immediate'
      },
      {
        id: 'knee-quad-sets',
        name: 'Quadriceps Sets',
        description: 'Strengthen the quadriceps muscle without bending the knee',
        category: 'strength',
        difficulty: 'beginner',
        duration: 10,
        repetitions: 15,
        sets: 3,
        instructions: [
          'Lie on your back with legs straight',
          'Tighten the muscle on top of your thigh',
          'Push the back of your knee down into the bed',
          'Hold for 5 seconds, then relax'
        ],
        precautions: [
          'Do not hold your breath',
          'Stop if knee pain increases',
          'Start gently and gradually increase intensity'
        ],
        benefits: [
          'Strengthens quadriceps muscle',
          'Improves knee stability',
          'Prevents muscle atrophy',
          'Supports knee joint'
        ],
        images: [
          'https://via.placeholder.com/150/00FF00/FFFFFF?text=Quad+Sets+1'
        ],
        videoUrl: 'https://www.youtube.com/embed/EX7_Y02_01Q', // Placeholder YouTube URL
        voiceInstructions: [
          'Lie on your back with legs straight',
          'Tighten the muscle on top of your thigh',
          'Push your knee down into the bed',
          'Hold for five seconds',
          'Relax and repeat'
        ],
        surgeryTypes: ['knee-replacement', 'acl-repair'],
        recoveryPhase: 'immediate'
      },
      {
        id: 'knee-heel-slides',
        name: 'Heel Slides',
        description: 'Gentle knee bending exercise to improve range of motion',
        category: 'mobility',
        difficulty: 'beginner',
        duration: 10,
        repetitions: 10,
        sets: 2,
        instructions: [
          'Lie on your back with operated leg straight',
          'Slowly slide your heel toward your buttocks',
          'Bend your knee as far as comfortable',
          'Hold for 5 seconds, then slide back to start'
        ],
        precautions: [
          'Move slowly and smoothly',
          'Do not force the bend',
          'Stop if pain is severe',
          'Use a towel under heel if needed'
        ],
        benefits: [
          'Improves knee flexibility',
          'Increases range of motion',
          'Prevents stiffness',
          'Promotes healing'
        ],
        images: [
          'https://via.placeholder.com/150/FFFF00/000000?text=Heel+Slides+1'
        ],
        videoUrl: 'https://www.youtube.com/embed/Q0g00-y_11A', // Placeholder YouTube URL
        voiceInstructions: [
          'Lie on your back with your leg straight',
          'Slowly slide your heel toward your buttocks',
          'Bend your knee as far as comfortable',
          'Hold for five seconds',
          'Slide back to the starting position'
        ],
        surgeryTypes: ['knee-replacement'],
        recoveryPhase: 'early'
      },
      // Hip Replacement Exercises
      {
        id: 'hip-abduction',
        name: 'Hip Abduction',
        description: 'Strengthen hip muscles by moving leg away from body',
        category: 'strength',
        difficulty: 'beginner',
        duration: 8,
        repetitions: 12,
        sets: 2,
        instructions: [
          'Lie on your back with legs straight',
          'Keep your toes pointing up',
          'Slide your operated leg out to the side',
          'Slide back to center slowly'
        ],
        precautions: [
          'Do not cross legs',
          'Keep movements controlled',
          'Stop if hip pain increases'
        ],
        benefits: [
          'Strengthens hip abductor muscles',
          'Improves hip stability',
          'Prevents hip dislocation',
          'Enhances balance'
        ],
        images: [
          'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Hip+Abduction+1'
        ],
        videoUrl: 'https://www.youtube.com/embed/A1g11-y_22B', // Placeholder YouTube URL
        voiceInstructions: [
          'Lie on your back with legs straight',
          'Keep your toes pointing up',
          'Slide your leg out to the side',
          'Slide back to center slowly'
        ],
        surgeryTypes: ['hip-replacement'],
        recoveryPhase: 'early'
      },
      // Shoulder Surgery Exercises
      {
        id: 'shoulder-pendulum',
        name: 'Pendulum Swings',
        description: 'Gentle shoulder movement to maintain mobility',
        category: 'mobility',
        difficulty: 'beginner',
        duration: 5,
        repetitions: 10,
        sets: 2,
        instructions: [
          'Stand and lean forward slightly',
          'Let your operated arm hang down',
          'Gently swing arm in small circles',
          'Change direction after 10 swings'
        ],
        precautions: [
          'Do not force the movement',
          'Keep movements small initially',
          'Support yourself with other hand'
        ],
        benefits: [
          'Maintains shoulder mobility',
          'Reduces stiffness',
          'Improves circulation',
          'Gentle range of motion'
        ],
        images: [
          'https://via.placeholder.com/150/00FFFF/000000?text=Pendulum+Swings+1'
        ],
        videoUrl: 'https://www.youtube.com/embed/B2h22-y_33C', // Placeholder YouTube URL
        voiceInstructions: [
          'Stand and lean forward slightly',
          'Let your arm hang down naturally',
          'Gently swing your arm in small circles',
          'Change direction after ten swings'
        ],
        surgeryTypes: ['shoulder-surgery', 'rotator-cuff-repair'],
        recoveryPhase: 'immediate'
      },
      // General Recovery Exercises
      {
        id: 'deep-breathing',
        name: 'Deep Breathing Exercise',
        description: 'Breathing exercise to prevent pneumonia and promote relaxation',
        category: 'cardio',
        difficulty: 'beginner',
        duration: 10,
        repetitions: 10,
        sets: 3,
        instructions: [
          'Sit comfortably or lie on your back',
          'Place one hand on chest, one on belly',
          'Breathe in slowly through your nose',
          'Feel your belly rise more than your chest',
          'Exhale slowly through pursed lips'
        ],
        precautions: [
          'Do not strain or force breathing',
          'Stop if you feel dizzy',
          'Breathe at your own pace'
        ],
        benefits: [
          'Prevents pneumonia',
          'Improves lung function',
          'Reduces stress and anxiety',
          'Promotes relaxation',
          'Enhances oxygen delivery'
        ],
        images: [
          'https://via.placeholder.com/150/800080/FFFFFF?text=Deep+Breathing+1'
        ],
        videoUrl: 'https://www.youtube.com/embed/C3i33-y_44D', // Placeholder YouTube URL
        voiceInstructions: [
          'Sit comfortably or lie on your back',
          'Place one hand on your chest, one on your belly',
          'Breathe in slowly through your nose',
          'Feel your belly rise',
          'Exhale slowly through pursed lips'
        ],
        surgeryTypes: ['all'],
        recoveryPhase: 'immediate'
      }
    ];

    // Index exercises by ID
    this.exerciseDatabase.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
    });
  }

  // Get exercises for specific surgery type and recovery phase
  getExercisesForSurgery(surgeryType: string, recoveryPhase: string): Exercise[] {
    return this.exerciseDatabase.filter(exercise => 
      (exercise.surgeryTypes.includes(surgeryType) || exercise.surgeryTypes.includes('all')) &&
      exercise.recoveryPhase === recoveryPhase
    );
  }

  // Get exercise by ID
  getExercise(id: string): Exercise | undefined {
    return this.exercises.get(id);
  }

  // Search exercises by name or category
  searchExercises(query: string, category?: string): Exercise[] {
    const lowerQuery = query.toLowerCase();
    return this.exerciseDatabase.filter(exercise => {
      const matchesQuery = exercise.name.toLowerCase().includes(lowerQuery) ||
                          exercise.description.toLowerCase().includes(lowerQuery);
      const matchesCategory = !category || exercise.category === category;
      return matchesQuery && matchesCategory;
    });
  }

  // Get personalized exercise plan
  getPersonalizedPlan(patientContext: {
    surgeryType: string;
    daysSinceSurgery: number;
    painLevel: number;
    mobilityLevel: number;
  }): Exercise[] {
    const { surgeryType, daysSinceSurgery, painLevel, mobilityLevel } = patientContext;
    
    // Determine recovery phase based on days since surgery
    let recoveryPhase: string;
    if (daysSinceSurgery <= 7) recoveryPhase = 'immediate';
    else if (daysSinceSurgery <= 30) recoveryPhase = 'early';
    else if (daysSinceSurgery <= 90) recoveryPhase = 'intermediate';
    else recoveryPhase = 'advanced';

    // Get base exercises for surgery type and phase
    let exercises = this.getExercisesForSurgery(surgeryType, recoveryPhase);

    // Filter based on pain level
    if (painLevel >= 7) {
      exercises = exercises.filter(ex => ex.difficulty === 'beginner' && ex.category === 'mobility');
    } else if (painLevel >= 4) {
      exercises = exercises.filter(ex => ex.difficulty !== 'advanced');
    }

    // Add general exercises
    const generalExercises = this.getExercisesForSurgery('all', recoveryPhase);
    exercises = [...exercises, ...generalExercises];

    // Remove duplicates and limit to 5-8 exercises
    const uniqueExercises = exercises.filter((ex, index, self) => 
      index === self.findIndex(e => e.id === ex.id)
    );

    return uniqueExercises.slice(0, 8);
  }

  // Start exercise session with voice guidance
  async startVoiceGuidedSession(exercises: Exercise[], voiceService: any): Promise<string> {
    const sessionId = `session-${Date.now()}`;
    
    await voiceService.speak(`Starting your exercise session with ${exercises.length} exercises. Let's begin!`);
    
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      
      await voiceService.speak(`Exercise ${i + 1}: ${exercise.name}. ${exercise.description}`);
      
      // Give instructions
      for (const instruction of exercise.voiceInstructions) {
        await voiceService.speak(instruction);
        await this.delay(2000); // 2 second pause between instructions
      }
      
      // Start exercise
      await voiceService.speak(`Begin the exercise. I'll count for you.`);
      
      if (exercise.repetitions) {
        for (let rep = 1; rep <= exercise.repetitions; rep++) {
          await voiceService.speak(`${rep}`);
          await this.delay(3000); // 3 seconds per rep
        }
      } else {
        // Duration-based exercise
        await voiceService.speak(`Continue for ${exercise.duration} minutes.`);
        await this.delay(exercise.duration * 60 * 1000);
      }
      
      await voiceService.speak(`Great job! Exercise complete. Take a 30-second rest.`);
      
      if (i < exercises.length - 1) {
        await this.delay(30000); // 30 second rest
      }
    }
    
    await voiceService.speak(`Excellent work! You've completed your exercise session. Remember to track how you feel.`);
    
    return sessionId;
  }

  // Get exercise video/image resources
  getExerciseMedia(exerciseId: string): { images: string[], videoUrl?: string } {
    const exercise = this.exercises.get(exerciseId);
    if (!exercise) {
      return { images: [] };
    }
    
    return {
      images: exercise.images,
      videoUrl: exercise.videoUrl
    };
  }

  // Track exercise completion
  async recordExerciseCompletion(sessionData: {
    patientId: string;
    exerciseId: string;
    completed: boolean;
    painLevelBefore?: number;
    painLevelAfter?: number;
    notes?: string;
  }): Promise<void> {
    // This would typically save to database
    console.log('Exercise completion recorded:', sessionData);
    
    // Store in localStorage for demo
    const completions = JSON.parse(localStorage.getItem('exerciseCompletions') || '[]');
    completions.push({
      ...sessionData,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('exerciseCompletions', JSON.stringify(completions));
  }

  // Get exercise progress analytics
  getExerciseProgress(patientId: string, days: number = 30): ExerciseProgress[] {
    const completions = JSON.parse(localStorage.getItem('exerciseCompletions') || '[]');
    const patientCompletions = completions.filter((c: any) => c.patientId === patientId);
    
    const progressMap = new Map<string, ExerciseProgress>();
    
    patientCompletions.forEach((completion: any) => {
      const exerciseId = completion.exerciseId;
      
      if (!progressMap.has(exerciseId)) {
        progressMap.set(exerciseId, {
          exerciseId,
          completionDates: [],
          averagePainLevel: 0,
          improvementScore: 0,
          consistency: 0
        });
      }
      
      const progress = progressMap.get(exerciseId)!;
      progress.completionDates.push(new Date(completion.timestamp));
      
      if (completion.painLevelAfter !== undefined) {
        progress.averagePainLevel = (progress.averagePainLevel + completion.painLevelAfter) / 2;
      }
    });
    
    // Calculate consistency and improvement scores
    progressMap.forEach((progress, exerciseId) => {
      const totalDays = days;
      const completionDays = progress.completionDates.length;
      progress.consistency = Math.min((completionDays / totalDays) * 100, 100);
      
      // Simple improvement score based on consistency and pain reduction
      progress.improvementScore = progress.consistency * 0.7 + 
        (progress.averagePainLevel > 0 ? (10 - progress.averagePainLevel) * 10 * 0.3 : 30);
    });
    
    return Array.from(progressMap.values());
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get exercise categories
  getCategories(): string[] {
    return ['mobility', 'strength', 'flexibility', 'balance', 'cardio'];
  }

  // Get exercises by category
  getExercisesByCategory(category: string): Exercise[] {
    return this.exerciseDatabase.filter(exercise => exercise.category === category);
  }

  // Get exercise recommendations based on current symptoms
  getExerciseRecommendations(symptoms: string[], painLevel: number): Exercise[] {
    let recommendations: Exercise[] = [];
    
    if (symptoms.includes('stiffness')) {
      recommendations.push(...this.getExercisesByCategory('mobility'));
    }
    
    if (symptoms.includes('weakness')) {
      recommendations.push(...this.getExercisesByCategory('strength'));
    }
    
    if (symptoms.includes('balance issues')) {
      recommendations.push(...this.getExercisesByCategory('balance'));
    }
    
    // Filter by pain level
    if (painLevel >= 6) {
      recommendations = recommendations.filter(ex => ex.difficulty === 'beginner');
    }
    
    return recommendations.slice(0, 5);
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService;