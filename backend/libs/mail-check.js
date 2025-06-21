import mailcheck from "mailcheck";

function isEmailTypo(email) {
  let suggestion = null;

  mailcheck.run({
    email,
    suggested: (suggested) => {
      suggestion = suggested.full;
    },
    domains: ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"],
  });

  return suggestion;
}
export { isEmailTypo };