export const authenticate = (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader)
		return res.status(401).json({
			success: false,
			message: "Unauthorized",
			code: 401,
		});

	const token = authHeader.split(" ")[1];

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(403).json({
			success: false,
			message: "Invalid token",
			code: 403,
		});
	}
};
