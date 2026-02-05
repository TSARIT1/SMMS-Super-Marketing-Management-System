package in.main;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePasswordHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "123abc";
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("");
        System.out.println("SQL UPDATE Command:");
        System.out.println("UPDATE users SET password_hash = '" + hash + "' WHERE email = 'weslyjohnpaulraj@gmail.com';");
    }
}
