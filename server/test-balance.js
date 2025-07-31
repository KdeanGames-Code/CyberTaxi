const { getUserBalance } = require("./shared/utils/query-utils");
async function test() {
    try {
        const balance = await getUserBalance(1);
        console.log("Balance:", balance);
    } catch (err) {
        console.error("Test failed:", err.message);
    }
}
test();
