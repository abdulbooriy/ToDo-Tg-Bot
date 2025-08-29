import { Bot, session } from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import { run } from "@grammyjs/runner";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const bot = new Bot(process.env.BOT_TOKEN || "");

bot.command("start", (ctx) =>
  ctx.reply(
    `Assalomu alaykum To-Do-Bot ga xush kelibsiz!\n\n/ - ushu belgi orqali bot dan foydalanishingiz mumkin`
  )
);

bot.use(session());
bot.use(conversations());

async function addToDo(conversation, ctx) {
  const userId = BigInt(ctx.from?.id || 0);
  if (!userId) {
    await ctx.reply(
      "Sizning ID'ingizni aniqlay olmadim. Iltimos qayta urinib ko'ring."
    );
    return;
  }

  await ctx.reply("Yangi vazifa nomini kiriting: ");
  const { message: titleMessage } = await conversation.wait();
  const taskName = titleMessage?.text;

  await ctx.reply(
    "Yangi vazifa vaqtini kiriting (format: kk.oo.yy ss:dd, masalan: 21.07.25 14:30): "
  );
  const { message: timeMessage } = await conversation.wait();
  const taskTime = timeMessage?.text;

  let formattedDate;

  try {
    const [date, time] = taskTime.split(" ");
    const [day, month, year] = date.split(".");
    const [hour, minute] = time.split(":");
    const fullYear = `20${year}`;

    formattedDate = new Date(
      parseInt(fullYear),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute)
    );
    if (formattedDate.toString() === "Invalid Date") {
      throw new Error("Invalid Date");
    }
  } catch (error) {
    await ctx.reply(
      "Sana va vaqt noto'g'ri formatda kiritildi. Iltimos 'kk.oo.yy ss:dd' formatidan foydalaning. Qaytadan /add buyrug'ini bering!"
    );
    return;
  }

  await ctx.reply(
    "Yangi vazifa darajasini kiriting (misol uchun: low, medium, high): "
  );
  const { message: levelMessage } = await conversation.wait();
  const taskLevel = levelMessage?.text.toLowerCase();

  if (!taskLevel || !["low", "medium", "high"].includes(taskLevel)) {
    await ctx.reply(
      "Noto'g'ri daraja kiritildi. Iltimos, low, medium yoki high dan birini kiriting. Qaytadan /add buyrug'ini bering!"
    );
    return;
  }

  try {
    await prisma.todo.create({
      data: {
        userId: userId,
        taskName,
        taskTime: formattedDate,
        taskLevel,
        status: "active",
      },
    });

    await ctx.reply(
      `Vazifa muvaffaqiyatli qo'shildi: ✅\n\n` +
        `Vazifa nomi: ${taskName}\n` +
        `Vazifa vaqti: ${taskTime}\n` +
        `Darajasi: ${taskLevel}`
    );
  } catch (error) {
    console.error(error);
    ctx.reply(
      "Ma'lumotlarni saqlashda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring"
    );
  }
}

async function completeToDo(conversation, ctx) {
  const userId = BigInt(ctx.from?.id || 0);
  if (!userId) {
    await ctx.reply(
      "Sizning ID'ingizni aniqlay olmadim. Iltimos qayta urinib ko'ring."
    );
    return;
  }

  const activeTodos = await prisma.todo.findMany({
    where: { userId: userId, status: "active" },
    orderBy: { createdAt: "asc" },
  });

  if (activeTodos.length === 0) {
    await ctx.reply(
      "Bajarilishi kerak bo'lgan vazifalar yo'q. /add buyrug'i bilan vazifa qo'shishingiz mumkin"
    );
    return;
  }

  let message =
    "Quyidagi vazifalardan qaysi birini bajarganingizni belgilang:\n\n";
  activeTodos.forEach((todo, index) => {
    message += `${index + 1}. ${todo.taskName}\n`;
  });

  await ctx.reply(message);

  await ctx.reply("Kerakli vazifa raqamini kiriting:");
  const { message: numberMessage } = await conversation.wait();
  const taskNumber = parseInt(numberMessage?.text || "");

  if (isNaN(taskNumber) || taskNumber < 1 || taskNumber > activeTodos.length) {
    await ctx.reply(
      "Noto'g'ri raqam kiritildi. Iltimos ro'yxatdagi raqamlardan birini kiriting"
    );
    return;
  }

  const taskToComplete = activeTodos[taskNumber - 1];

  try {
    await prisma.todo.update({
      where: { id: taskToComplete.id, userId: userId },
      data: { status: "completed" },
    });

    await ctx.reply(
      `Vazifa "${taskToComplete.taskName}" bajarilgan deb belgilandi ✅`
    );
  } catch (error) {
    console.error("Vazifani yangilashda xato:", error);
    await ctx.reply(
      "Vazifani yangilashda xatolik yuz berdi. Iltimos qayta urinib ko'rish uchun /complete buyrug'ini bering!"
    );
  }
}

async function deleteToDo(conversation, ctx) {
  const userId = BigInt(ctx.from?.id || 0);
  if (!userId) {
    await ctx.reply(
      "Sizning ID'ingizni aniqlay olmadim. Iltimos qayta urinib ko'ring."
    );
    return;
  }

  const activeTodos = await prisma.todo.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "asc" },
  });

  if (activeTodos.length === 0) {
    await ctx.reply(
      "O'chirilishi kerak bo'lgan vazifalar yo'q. /add buyrug'i bilan vazifa qo'shishingiz mumkin"
    );
    return;
  }

  let message = "Quyidagi vazifalardan qaysi birini o'chirmoqchisiz:\n\n";
  activeTodos.forEach((todo, index) => {
    message += `${index + 1}. ${todo.taskName}\n`;
  });

  await ctx.reply(message);

  await ctx.reply("Kerakli vazifa raqamini kiriting:");
  const { message: numberMessage } = await conversation.wait();
  const taskNumber = parseInt(numberMessage?.text || "");

  if (isNaN(taskNumber) || taskNumber < 1 || taskNumber > activeTodos.length) {
    await ctx.reply(
      "Noto'g'ri raqam kiritildi. Iltimos ro'yxatdagi raqamlardan birini kiriting."
    );
    return;
  }

  const taskToDelete = activeTodos[taskNumber - 1];

  try {
    await prisma.todo.delete({ where: { id: taskToDelete.id } });
    await ctx.reply(
      `Vazifa "${taskToDelete.taskName}" muvaffaqiyatli o'chirildi ✅`
    );
  } catch (error) {
    console.error("Vazifani o'chirishda xato:", error);
    await ctx.reply(
      "Vazifani o'chirishda xatolik yuz berdi. Iltimos qayta urinib ko'rish uchun /delete buyrug'ini bering!"
    );
  }
}

async function showAllTodo(ctx) {
  const userId = BigInt(ctx.from?.id || 0);
  if (!userId) {
    await ctx.reply(
      "Sizning ID'ingizni aniqlay olmadim. Iltimos qayta urinib ko'ring."
    );
    return;
  }

  const allToDo = await prisma.todo.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "asc" },
  });

  if (allToDo.length === 0) {
    ``;
    await ctx.reply(
      "Sizda xali hech qanday vazifalar yo'q. /add buyrug'i bilan vazifa qo'shishingiz mumkin"
    );
    return;
  }

  let message = "Sizning vazifalar ro'yxatingiz:\n\n";

  allToDo.forEach((todo, index) => {
    const taskTime = todo.taskTime
      ? todo.taskTime.toLocaleString("uz-UZ", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "belgilanmagan";

    const status = todo.status === "completed" ? "bajarilgan" : "faol";
    const todo_level = todo.taskLevel || "aniqlanmagan";

    message += `${index + 1}. ${todo.taskName}\n`;
    message += `   - Vaqti: ${taskTime}\n`;
    message += `   - Darajasi: ${todo_level}\n`;
    message += `   - Holati: ${status}\n\n`;
  });

  await ctx.reply(message, { parse_mode: "Markdown" });
}

bot.use(createConversation(addToDo, "addToDoConversation"));
bot.use(createConversation(completeToDo, "completeToDoConversation"));
bot.use(createConversation(deleteToDo, "deleteToDoConversation"));

bot.command("add", async (ctx) => {
  await ctx.conversation.enter("addToDoConversation");
});

bot.command("complete", async (ctx) => {
  await ctx.conversation.enter("completeToDoConversation");
});

bot.command("delete", async (ctx) => {
  await ctx.conversation.enter("deleteToDoConversation");
});

bot.command("tasks", showAllTodo);

try {
  run(bot);
  console.log("Bot ishga tushdi!");
} catch (err) {
  console.error(`Bot ishga tushishda xatolik yuz berdi: ${err}`);
}
