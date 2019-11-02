import adapter from "./adapter";
import {expect} from "chai";


const authTests: any = () => {
    context("login", () => {
        it("empty credentials", async () => {
            const {success, data, error} = await adapter.login("","");
            expect(success, "Should not be able to login. Error: " + error).to.be.false;
        });

        it("incorrect credentials", async () => {
            const {success, data, error} = await adapter.login("asd","qwe");
            expect(success, "Should not be able to login. Error: " + error).to.be.false;
        });

        it("incorrect password", async () => {
            const {success, data, error} = await adapter.login("peter@galvanize.com","qwe");
            expect(success, "Should not be able to login. Error: " + error).to.be.false;
        });

        it("correct crendetials", async () => {
            const {success, data, error} = await adapter.login("peter@galvanize.com","i<3peter");
            expect(success, "Should be able to login. Error: " + error).to.be.true;
            expect(data.length).to.be.greaterThan(0);
        });
    });

    context("logout", () => {
        it("delete token", async () => {
            const {data} = await adapter.login("peter@galvanize.com","i<3peter");
            const token = data;

            const {success} = await adapter.logout(token);
            expect(success, "Should be able to logout.").to.be.true;
        });
    });

    context("auth token", () => {
        it("empty token", async () => {
            const {success, data, error} = await adapter.authenticateToken("");
            expect(success, "Should not be authenticated. Error: " + error).to.be.false;
        });

        it("unidentified token", async () => {
            const {success, data, error} = await adapter.authenticateToken("asdgqegqwt13asg");
            expect(success, "Should not be authenticated. Error: " + error).to.be.false;
        });

        it("check token", async () => {
            const res = await adapter.login("peter@galvanize.com","i<3peter");
            const token = res.data;

            const {success, data} = await adapter.authenticateToken(token);
            expect(success, "Should be authenticated.").to.be.true;
            expect(data, "Should be a valid token.").to.be.true;
        });
    })
};

export default authTests;