export const generateToken = (user, message, statusCode, res) => {
  const token = user.generateJsonWebToken();
  const isProduction = process.env.NODE_ENV === "production";
  const cookieExpiresDays = Number(process.env.COOKIE_EXPIRES || 7);

  res
    .status(statusCode)
    .cookie("token", token, {
      expires: new Date(Date.now() + cookieExpiresDays * 24 * 60 * 60 * 1000),
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction,
    })
    .json({
      success: true,
      message,
      user,
      token,
    });
};

