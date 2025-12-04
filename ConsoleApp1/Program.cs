using Microsoft.AspNetCore.Identity;
using System;

// هذا الكلاس الوهمي يمثل نموذج TPLUser (لا تحتاجين لإنشاء الملف، فقط الكلاس)
public class DummyUser { }

public class Program
{
    public static void Main(string[] args)
    {
        // 1. الباسورد الذي تريدينه (تذكري أننا سنستخدم هذا النص في Login Postman)
        string plainPassword = "Admin@12345";

        // 2. توليد الـ Hash
        var hasher = new PasswordHasher<DummyUser>();
        string hashedPassword = hasher.HashPassword(new DummyUser(), plainPassword);

        // 3. طباعة الناتج
        Console.WriteLine("الـ HASH الذي يجب لصقه في SQL:");
        Console.WriteLine(hashedPassword);

        Console.ReadKey();
    }
}