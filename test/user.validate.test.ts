import User from "@/src/models/User";

describe("User.validate()", () => {
    it("should fail validation with invalid data", async () => {
        const user = new User({
            fullName: "Test",
            email: "abc",
            phone: "123",
            passwordHash: "123",
            role: "nguoi_tim_tro",
        });

        let error: any = null;

        try {
            await user.validate();
        } catch (err) {
            error = err;
        }

        expect(error).toBeDefined();
    });

    it("should pass validation with valid data", async () => {
        const user = new User({
            fullName: "Test",
            email: "test@gmail.com",
            phone: "0987654321",
            passwordHash: "123",
            role: "nguoi_tim_tro",
        });

        await expect(user.validate()).resolves.toBeUndefined();
    });
});