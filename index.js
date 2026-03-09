const app = require("./src/app");
require("./src/database");

const main = async () => {
    await app.listen(app.get("PORT"));
    if(app.get("STAGE") == "DEVELOPMENT") console.log(`Server on port ${app.get("PORT")} in ${app.get("STAGE")} mode`);
}

main();
