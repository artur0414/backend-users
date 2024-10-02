//Inyección de dependencias de userModel en createApp para usar MySQL

import { createApp } from "./index.js";
import { UserModel } from "./models/user.js";

createApp({ userModel: UserModel });
