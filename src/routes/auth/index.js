import e from "express";

const router = e.Router();

router.get("/login", (req, res) => {
	res.status(200).json({
		message: "Login",
	});
});

export default router;
