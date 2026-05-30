const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

exports.selfUpdate = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: "Command is required",
      });
    }
    const backendRoot = path.join(__dirname, "..");

     const personaPath = path.join(backendRoot, "config", "persona.js");  
     const backupPath = path.join(backendRoot, "config", "persona.backup.js");

    const originalCode = fs.readFileSync(personaPath, "utf-8");

    fs.writeFileSync(backupPath, originalCode);

    let updatedPersonality = originalCode;

    if (command.toLowerCase().includes("sarcastic")) {
      updatedPersonality = `
module.exports = {
  assistantName: "Aditi",
  userName: "Ashutosh",
  personality: \`
Speak like a warm, playful, sarcastic close friend.
Use light teasing, but never be rude or hurtful.
Be emotionally aware.
Keep replies short and natural.
Avoid robotic assistant language.
\`
};
`;
    } else if (command.toLowerCase().includes("soft")) {
      updatedPersonality = `
module.exports = {
  assistantName: "Aditi",
  userName: "Ashutosh",
  personality: \`
Speak softly, warmly, and patiently.
Be emotionally supportive.
Use gentle words.
Keep replies natural and human-like.
Avoid robotic assistant language.
\`
};
`;
    } else {
      return res.status(200).json({
        success: false,
        message: "I can only update persona style for now.",
      });
    }

    fs.writeFileSync(personaPath, updatedPersonality);

    exec("node --check config/persona.js", { cwd: path.join(__dirname, "..") }, (error) => {
      if (error) {
        fs.writeFileSync(personaPath, originalCode);

        return res.status(500).json({
          success: false,
          message: "Update failed. Restored old persona.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Aditi persona updated successfully.",
      });
    });
  } catch (error) {
  console.log("SELF UPDATE ERROR:", error.message);

  return res.status(500).json({
    success: false,
    message: error.message,
  });
}
};