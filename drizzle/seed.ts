import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "~/server/lib/db/schema";
import { auth } from "~/auth.server";
import { ADMIN_USER, SEED_USERS } from "./seed.config";
import { randomUUID } from "crypto";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL est requis dans votre fichier .env");
  process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client, { schema });

const allUsers = [ADMIN_USER, ...SEED_USERS];
const shouldReset = process.argv.includes("--reset");

async function resetDatabase() {
  console.log("Purge des tables...");
  // Ordre important: supprimer les tables enfants d'abord
  await db.delete(schema.ratings);
  await db.delete(schema.bookings);
  await db.delete(schema.availabilities);
  await db.delete(schema.courses);
  await db.delete(schema.teachers);
  await db.delete(schema.learners);
  await db.delete(schema.session);
  await db.delete(schema.account);
  await db.delete(schema.verification);
  await db.delete(schema.user);
  console.log("Tables purgees.\n");
}

async function seedUsers() {
  console.log("=== Creation des utilisateurs ===\n");

  const createdUsers: { email: string; id: string }[] = [];

  for (const userData of allUsers) {
    try {
      const result = await auth.api.signUpEmail({
        body: {
          name: userData.name,
          email: userData.email,
          password: userData.password,
        },
      });

      if (result?.user) {
        console.log(`[OK] ${userData.name} cree (${userData.email})`);
        createdUsers.push({ email: userData.email, id: result.user.id });
      }
    } catch (error: any) {
      const message = error?.message || error?.body?.message || String(error);
      if (message.includes("already") || message.includes("User")) {
        console.log(`[SKIP] ${userData.email} existe deja`);
        const existingUser = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.email, userData.email))
          .limit(1);
        if (existingUser[0]) {
          createdUsers.push({ email: userData.email, id: existingUser[0].id });
        }
      } else {
        console.error(`[ERR] ${userData.email}: ${message}`);
      }
    }
  }

  return createdUsers;
}

async function seedTeachersAndLearners(users: { email: string; id: string }[]) {
  console.log("\n=== Creation des profils teachers/learners ===\n");

  const teacherIds: { email: string; teacherId: string }[] = [];
  const learnerIds: { email: string; learnerId: string }[] = [];

  for (const user of users) {
    const isTeacher =
      user.email === "demo@demo.com" || user.email === "admin@admin.com";
    const isLearner =
      user.email === "test@test.com" || user.email === "admin@admin.com";

    if (isTeacher) {
      const existingTeacher = await db
        .select()
        .from(schema.teachers)
        .where(eq(schema.teachers.userId, user.id))
        .limit(1);

      if (existingTeacher.length === 0) {
        const teacherId = randomUUID();
        await db.insert(schema.teachers).values({
          id: teacherId,
          userId: user.id,
          description:
            user.email === "demo@demo.com"
              ? "Professeur de musique passionné avec 10 ans d'expérience"
              : "Administrateur et professeur polyvalent",
          skills:
            user.email === "demo@demo.com"
              ? "Piano, Guitare, Solfège"
              : "Piano, Guitare, Batterie, Chant",
          graduations: {
            diplomas: [
              { name: "Conservatoire National", year: 2015 },
              { name: "Master en Musicologie", year: 2017 },
            ],
          },
        });
        console.log(`[OK] Teacher profile cree pour ${user.email}`);
        teacherIds.push({ email: user.email, teacherId });
      } else {
        console.log(`[SKIP] Teacher profile existe deja pour ${user.email}`);
        teacherIds.push({
          email: user.email,
          teacherId: existingTeacher[0].id,
        });
      }
    }

    if (isLearner) {
      const existingLearner = await db
        .select()
        .from(schema.learners)
        .where(eq(schema.learners.userId, user.id))
        .limit(1);

      if (existingLearner.length === 0) {
        const learnerId = randomUUID();
        await db.insert(schema.learners).values({
          id: learnerId,
          userId: user.id,
        });
        console.log(`[OK] Learner profile cree pour ${user.email}`);
        learnerIds.push({ email: user.email, learnerId });
      } else {
        console.log(`[SKIP] Learner profile existe deja pour ${user.email}`);
        learnerIds.push({
          email: user.email,
          learnerId: existingLearner[0].id,
        });
      }
    }
  }

  return { teacherIds, learnerIds };
}

async function seedCourses(teacherIds: { email: string; teacherId: string }[]) {
  console.log("\n=== Creation des cours ===\n");

  const courseData = [
    {
      teacherEmail: "demo@demo.com",
      courses: [
        {
          title: "Initiation au Piano",
          description:
            "Cours pour débutants. Apprenez les bases du piano: posture, lecture de notes, premiers morceaux.",
          duration: 60,
          level: "debutant" as const,
          price: "35.00",
          category: "piano" as const,
          isPublished: true,
        },
        {
          title: "Piano Intermédiaire",
          description:
            "Perfectionnez votre technique pianistique. Travail sur les gammes, arpèges et morceaux classiques.",
          duration: 60,
          level: "intermediaire" as const,
          price: "45.00",
          category: "piano" as const,
          isPublished: true,
        },
        {
          title: "Guitare Acoustique Débutant",
          description:
            "Premiers pas à la guitare: accords de base, rythmes simples, chansons populaires.",
          duration: 45,
          level: "debutant" as const,
          price: "30.00",
          category: "guitare" as const,
          isPublished: true,
        },
      ],
    },
    {
      teacherEmail: "admin@admin.com",
      courses: [
        {
          title: "Batterie - Les Fondamentaux",
          description:
            "Maîtrisez les rudiments de la batterie: coordination, rythmes de base, fills simples.",
          duration: 60,
          level: "debutant" as const,
          price: "40.00",
          category: "batterie" as const,
          isPublished: true,
        },
        {
          title: "Cours de Chant",
          description:
            "Développez votre voix: technique vocale, respiration, interprétation.",
          duration: 45,
          level: "debutant" as const,
          price: "38.00",
          category: "chant" as const,
          isPublished: true,
        },
      ],
    },
  ];

  const createdCourses: { courseId: string; teacherId: string }[] = [];

  for (const teacherData of courseData) {
    const teacher = teacherIds.find(
      (t) => t.email === teacherData.teacherEmail,
    );
    if (!teacher) {
      console.log(`[SKIP] Teacher ${teacherData.teacherEmail} non trouvé`);
      continue;
    }

    for (const course of teacherData.courses) {
      const existingCourse = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.title, course.title))
        .limit(1);

      if (existingCourse.length === 0) {
        const courseId = randomUUID();
        await db.insert(schema.courses).values({
          id: courseId,
          teacherId: teacher.teacherId,
          ...course,
        });
        console.log(`[OK] Cours "${course.title}" cree`);
        createdCourses.push({ courseId, teacherId: teacher.teacherId });
      } else {
        console.log(`[SKIP] Cours "${course.title}" existe deja`);
        createdCourses.push({
          courseId: existingCourse[0].id,
          teacherId: teacher.teacherId,
        });
      }
    }
  }

  return createdCourses;
}

async function seedAvailabilities(
  teacherIds: { email: string; teacherId: string }[],
) {
  console.log("\n=== Creation des disponibilites ===\n");

  const now = new Date();
  const availabilities: {
    teacherId: string;
    startTime: Date;
    endTime: Date;
  }[] = [];

  for (const teacher of teacherIds) {
    for (let day = 1; day <= 5; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);

      const morningStart = new Date(date);
      morningStart.setHours(10, 0, 0, 0);
      const morningEnd = new Date(date);
      morningEnd.setHours(12, 0, 0, 0);

      const afternoonStart = new Date(date);
      afternoonStart.setHours(14, 0, 0, 0);
      const afternoonEnd = new Date(date);
      afternoonEnd.setHours(18, 0, 0, 0);

      availabilities.push(
        {
          teacherId: teacher.teacherId,
          startTime: morningStart,
          endTime: morningEnd,
        },
        {
          teacherId: teacher.teacherId,
          startTime: afternoonStart,
          endTime: afternoonEnd,
        },
      );
    }
  }

  let created = 0;
  const createdAvailabilities: {
    id: string;
    teacherId: string;
    startTime: Date;
    endTime: Date;
  }[] = [];

  for (const availability of availabilities) {
    const availabilityId = randomUUID();
    try {
      await db.insert(schema.availabilities).values({
        id: availabilityId,
        ...availability,
      });
      created++;
      createdAvailabilities.push({
        id: availabilityId,
        ...availability,
      });
    } catch (error) {
      console.error(
        "[WARN] Echec de creation de la disponibilite",
        {
          availabilityId,
          teacherId: availability.teacherId,
          startTime: availability.startTime,
          endTime: availability.endTime,
        },
        error,
      );
    }
  }

  console.log(`[OK] ${created} disponibilites creees`);
  return createdAvailabilities;
}

async function seedBookings(
  courses: { courseId: string; teacherId: string }[],
  availabilities: {
    id: string;
    teacherId: string;
    startTime: Date;
    endTime: Date;
  }[],
  learnerIds: { email: string; learnerId: string }[],
): Promise<number> {
  console.log("\n=== Creation des reservations (bookings) ===\n");

  if (learnerIds.length === 0) {
    console.log("[SKIP] Aucun learner disponible pour les reservations");
    return 0;
  }

  const statuses: Array<"pending" | "confirmed" | "cancelled"> = [
    "pending",
    "confirmed",
    "cancelled",
  ];
  let created = 0;

  // Récupérer les détails des courses pour avoir les prix
  const courseDetails = await Promise.all(
    courses.map(async (course) => {
      const detail = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, course.courseId))
        .limit(1);
      return { ...course, ...detail[0] };
    }),
  );

  // Créer des bookings pour chaque combination de cours et créneau disponible
  for (let i = 0; i < courseDetails.length; i++) {
    const courseDetail = courseDetails[i];

    // Prendre les disponibilités du professeur du cours
    const teacherAvailabilities = availabilities.filter(
      (a) => a.teacherId === courseDetail.teacherId,
    );

    // Pour chaque disponibilité, créer des réservations avec différents learners
    for (let j = 0; j < teacherAvailabilities.length && j < 3; j++) {
      const availability = teacherAvailabilities[j];
      const learnerIdx = (i + j) % learnerIds.length; // Distribuer sur les learners
      const learner = learnerIds[learnerIdx];

      const booking: typeof schema.bookings.$inferInsert = {
        id: randomUUID(),
        courseId: courseDetail.courseId,
        availabilityId: availability.id,
        learnerId: learner.learnerId,
        startTime: new Date(availability.startTime),
        endTime: new Date(availability.endTime),
        priceAtBooking: courseDetail.price,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentIntentId: Math.random() > 0.3 ? `pi_${randomUUID()}` : undefined,
      };

      try {
        await db.insert(schema.bookings).values(booking);
        created++;
      } catch (error) {
        console.error(
          "[WARN] Echec de creation du booking",
          {
            courseId: booking.courseId,
            learnerId: booking.learnerId,
            availabilityId: booking.availabilityId,
          },
          error,
        );
      }
    }
  }

  console.log(`[OK] ${created} reservations creees`);
  return created;
}

async function seedRatings(
  courses: { courseId: string; teacherId: string }[],
  learnerIds: { email: string; learnerId: string }[],
): Promise<number> {
  console.log("\n=== Creation des notes (ratings) ===\n");

  if (learnerIds.length === 0 || courses.length === 0) {
    console.log("[SKIP] Pas assez de données pour créer des notes");
    return 0;
  }

  const ratingTitles = [
    "Excellent professeur",
    "Très bon cours",
    "Cours informatif",
    "Recommandé",
    "Très utile",
    "Bonne pédagogie",
    "Professeur patient",
    "Contenu intéressant",
  ];

  const ratingDescriptions = [
    "Un excellent cours, très bien expliqué et adapté à mon niveau.",
    "Le professeur est très engageant et explique très bien. Vivement recommandé!",
    "J'ai beaucoup appris pendant ce cours. Merci!",
    "Cours de qualité avec un très bon professeur.",
    "Parfait pour débuter. Très constructif et motivant.",
    "Une belle expérience d'apprentissage.",
    "Le professeur est attentif aux questions et très professionnel.",
    "Contenu très complet et bien structuré.",
    "J'ai vraiment apprécié ce cours. À refaire!",
    "Excellent rapport qualité-prix.",
  ];

  let created = 0;

  // Créer des ratings pour certains courses
  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];

    // Pour chaque cours, créer 2-4 ratings avec différents learners
    const numRatings = Math.floor(Math.random() * 3) + 2;

    for (let j = 0; j < numRatings && j < learnerIds.length; j++) {
      const learnerIdx = (i + j) % learnerIds.length;
      const learner = learnerIds[learnerIdx];

      // Ne pas créer de rating si le learner est le professeur du cours
      const courseDetail = await db
        .select()
        .from(schema.courses)
        .where(eq(schema.courses.id, course.courseId))
        .limit(1);

      if (
        courseDetail[0]?.teacherId === course.teacherId &&
        learner.email === "admin@admin.com"
      ) {
        continue;
      }

      const title =
        ratingTitles[Math.floor(Math.random() * ratingTitles.length)];
      const description =
        ratingDescriptions[
          Math.floor(Math.random() * ratingDescriptions.length)
        ];
      const rate = (Math.floor(Math.random() * 5) + 1).toString(); // Note de 1 à 5

      const rating: typeof schema.ratings.$inferInsert = {
        id: randomUUID(),
        courseId: course.courseId,
        learnerId: learner.learnerId,
        title,
        description,
        rate,
      };

      try {
        await db.insert(schema.ratings).values(rating);
        created++;
      } catch (error) {
        console.error(
          "[WARN] Echec de creation de la note",
          {
            courseId: rating.courseId,
            learnerId: rating.learnerId,
          },
          error,
        );
      }
    }
  }

  console.log(`[OK] ${created} notes creees`);
  return created;
}

async function seed() {
  console.log("Demarrage du seeding...\n");

  if (shouldReset) {
    await resetDatabase();
  }

  const users = await seedUsers();

  const { teacherIds, learnerIds } = await seedTeachersAndLearners(users);

  const courses = await seedCourses(teacherIds);

  const availabilities = await seedAvailabilities(teacherIds);

  const bookings = await seedBookings(courses, availabilities, learnerIds);

  const ratings = await seedRatings(courses, learnerIds);

  console.log("\n=== Résumé ===");
  console.log(`Utilisateurs: ${users.length}`);
  console.log(`Teachers: ${teacherIds.length}`);
  console.log(`Learners: ${learnerIds.length}`);
  console.log(`Cours: ${courses.length}`);
  console.log(`Disponibilites: ${availabilities.length}`);
  console.log(`Reservations: ${bookings}`);
  console.log(`Notes: ${ratings}`);
}

seed()
  .then(() => {
    console.log("\nSeeding termine !");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Erreur fatale:", error);
    process.exit(1);
  });
