function copyInstall(btn) {
  const text = [
    "git clone https://github.com/hantheemp/cliary.git",
    "cd cliary && npm install",
    "npm run build && npm link",
  ].join("\n");
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "copied";
    setTimeout(() => {
      btn.textContent = original;
    }, 1600);
  });
}
