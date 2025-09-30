import router from "express"
import { registerUser } from "../controllers/auth.controller.js"

const registerUserRouter = router()

registerUserRouter.route("/register").post(registerUser)

export default registerUserRouter;
