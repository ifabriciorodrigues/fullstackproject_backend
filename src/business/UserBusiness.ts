import { UserInputDTO, LoginInputDTO } from "../model/User";
import { UserDatabase } from "../data/UserDatabase";
import { IdGenerator } from "../services/IdGenerator";
import { HashManager } from "../services/HashManager";
import { Authenticator } from "../services/Authenticator";

export class UserBusiness {

    async createUser(user: UserInputDTO) {

        const idGenerator = new IdGenerator();
        const id = idGenerator.generate();

        const hashManager = new HashManager();
        const hashPassword = await hashManager.hash(user.password);

        const userDatabase = new UserDatabase();
        const userVerification = await userDatabase.getUserByEmail(user.email)

        if(userVerification.getEmail() === user.email) {
            throw new Error("This email is registered already!")
        } else {
            await userDatabase.createUser(id, user.name, user.email, hashPassword);
        }

        const authenticator = new Authenticator();
        const accessToken = authenticator.generateToken({ id });

        return accessToken;
    }

    async getUserByEmail(user: LoginInputDTO) {
        console.log(user.email)
        const userDatabase = new UserDatabase();
        const userFromDB = await userDatabase.getUserByEmail(user.email);

        const hashManager = new HashManager();
        const hashCompare = await hashManager.compare(user.password, userFromDB.getPassword());

        const authenticator = new Authenticator();
        const accessToken = authenticator.generateToken({ id: userFromDB.getId() });

        if (!hashCompare) {
            throw new Error("Invalid Password!");
        }

        return accessToken;
    }
}