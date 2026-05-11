package com.fsad.mutualfund.config;

import com.fsad.mutualfund.entity.AdvisorProfile;
import com.fsad.mutualfund.entity.InvestorProfile;
import com.fsad.mutualfund.entity.MutualFund;
import com.fsad.mutualfund.entity.User;
import com.fsad.mutualfund.repository.AdvisorProfileRepository;
import com.fsad.mutualfund.repository.InvestorProfileRepository;
import com.fsad.mutualfund.repository.MutualFundRepository;
import com.fsad.mutualfund.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InvestorProfileRepository investorProfileRepository;
    private final AdvisorProfileRepository advisorProfileRepository;
    private final MutualFundRepository mutualFundRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      InvestorProfileRepository investorProfileRepository,
                      AdvisorProfileRepository advisorProfileRepository,
                      MutualFundRepository mutualFundRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.investorProfileRepository = investorProfileRepository;
        this.advisorProfileRepository = advisorProfileRepository;
        this.mutualFundRepository = mutualFundRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            System.out.println("Seeding database with demo users...");
            seedUsers();
        }

        if (mutualFundRepository.count() == 0) {
            System.out.println("Seeding database with curated mutual funds...");
            seedFunds();
        }

        System.out.println("Database seeding complete.");
    }

    private void seedUsers() {
        User admin = User.builder()
                .email("admin@mutualfund.com")
                .password(passwordEncoder.encode("admin123"))
                .fullName("System Administrator")
                .role(User.Role.ADMIN)
                .authProvider(User.AuthProvider.LOCAL)
                .verified(true)
                .build();
        userRepository.save(admin);

        User investor = User.builder()
                .email("investor@demo.com")
                .password(passwordEncoder.encode("investor123"))
                .fullName("Rahul Sharma")
                .role(User.Role.INVESTOR)
                .authProvider(User.AuthProvider.LOCAL)
                .verified(true)
                .build();
        investor = userRepository.save(investor);

        InvestorProfile investorProfile = InvestorProfile.builder()
                .user(investor)
                .riskToleranceScore(55)
                .riskCategory(InvestorProfile.RiskCategory.MODERATE)
                .walletBalance(new BigDecimal("250000.0000"))
                .investmentHorizon("3-5 years")
                .build();
        investorProfileRepository.save(investorProfile);

        User advisor1 = User.builder()
                .email("advisor@demo.com")
                .password(passwordEncoder.encode("advisor123"))
                .fullName("Dr. Priya Patel")
                .role(User.Role.ADVISOR)
                .authProvider(User.AuthProvider.LOCAL)
                .verified(true)
                .build();
        advisor1 = userRepository.save(advisor1);

        AdvisorProfile advisorProfile1 = AdvisorProfile.builder()
                .user(advisor1)
                .specialization("Retirement Planning & Wealth Management")
                .consultationFee(new BigDecimal("75.00"))
                .experienceYears(12)
                .bio("Certified Financial Planner with 12+ years of experience in retirement planning and wealth management. Specialized in long-term portfolio construction for risk-averse investors.")
                .averageRating(4.8)
                .totalReviews(156)
                .build();
        advisorProfileRepository.save(advisorProfile1);

        User advisor2 = User.builder()
                .email("advisor2@demo.com")
                .password(passwordEncoder.encode("advisor123"))
                .fullName("Vikram Singh")
                .role(User.Role.ADVISOR)
                .authProvider(User.AuthProvider.LOCAL)
                .verified(true)
                .build();
        advisor2 = userRepository.save(advisor2);

        AdvisorProfile advisorProfile2 = AdvisorProfile.builder()
                .user(advisor2)
                .specialization("Tax Saving & ELSS Investments")
                .consultationFee(new BigDecimal("50.00"))
                .experienceYears(8)
                .bio("Expert in tax-saving mutual fund strategies with a focus on ELSS funds. Helps clients optimize their Section 80C investments while maximizing returns.")
                .averageRating(4.5)
                .totalReviews(89)
                .build();
        advisorProfileRepository.save(advisorProfile2);

        User analyst = User.builder()
                .email("analyst@demo.com")
                .password(passwordEncoder.encode("analyst123"))
                .fullName("Anita Desai")
                .role(User.Role.ANALYST)
                .authProvider(User.AuthProvider.LOCAL)
                .verified(true)
                .build();
        userRepository.save(analyst);
    }

    private void seedFunds() {
        seedFund("120503", "Axis Bluechip Fund - Direct Plan - Growth", "MF120503",
                MutualFund.Category.EQUITY, "0.64", 4, "68.4200", "Axis Mutual Fund",
                "Large-cap equity fund focused on established Indian companies.",
                "500.0000");
        seedFund("118989", "HDFC Balanced Advantage Fund - Direct Plan - Growth", "MF118989",
                MutualFund.Category.HYBRID, "0.75", 3, "521.1800", "HDFC Mutual Fund",
                "Dynamic asset allocation fund balancing equity and debt exposure.",
                "100.0000");
        seedFund("120716", "ICICI Prudential Bluechip Fund - Direct Plan - Growth", "MF120716",
                MutualFund.Category.EQUITY, "0.91", 4, "114.2600", "ICICI Prudential Mutual Fund",
                "Large-cap equity strategy with diversified sector exposure.",
                "100.0000");
        seedFund("118834", "Kotak Emerging Equity Fund - Direct Plan - Growth", "MF118834",
                MutualFund.Category.EQUITY, "0.39", 5, "153.8700", "Kotak Mahindra Mutual Fund",
                "Mid-cap equity fund designed for higher-growth allocation.",
                "100.0000");
        seedFund("125497", "Mirae Asset Large Cap Fund - Direct Plan - Growth", "MF125497",
                MutualFund.Category.EQUITY, "0.54", 4, "126.7100", "Mirae Asset Mutual Fund",
                "Large-cap growth fund investing across leading Indian businesses.",
                "500.0000");
        seedFund("120465", "Parag Parikh Flexi Cap Fund - Direct Plan - Growth", "MF120465",
                MutualFund.Category.EQUITY, "0.63", 4, "95.3600", "PPFAS Mutual Fund",
                "Flexi-cap strategy with Indian and global equity allocation.",
                "1000.0000");
        seedFund("118550", "SBI Liquid Fund - Direct Plan - Growth", "MF118550",
                MutualFund.Category.DEBT, "0.21", 1, "3892.6400", "SBI Mutual Fund",
                "Liquid debt fund for low-risk cash management needs.",
                "500.0000");
        seedFund("119551", "Aditya Birla Sun Life Tax Relief 96 - Direct Plan - Growth", "MF119551",
                MutualFund.Category.ELSS, "0.98", 4, "59.4800", "Aditya Birla Sun Life Mutual Fund",
                "ELSS tax-saving equity fund with long-term wealth focus.",
                "500.0000");
        seedFund("125354", "Nippon India Small Cap Fund - Direct Plan - Growth", "MF125354",
                MutualFund.Category.EQUITY, "0.72", 5, "189.3200", "Nippon India Mutual Fund",
                "Small-cap equity fund for aggressive long-term investors.",
                "100.0000");
        seedFund("120586", "SBI Contra Fund - Direct Plan - Growth", "MF120586",
                MutualFund.Category.EQUITY, "0.62", 5, "407.9100", "SBI Mutual Fund",
                "Contrarian equity strategy investing away from consensus themes.",
                "500.0000");
        seedFund("118825", "ICICI Prudential Corporate Bond Fund - Direct Plan - Growth", "MF118825",
                MutualFund.Category.DEBT, "0.28", 2, "34.7600", "ICICI Prudential Mutual Fund",
                "Corporate bond fund focused on high-quality debt instruments.",
                "100.0000");
        seedFund("120834", "Canara Robeco Equity Hybrid Fund - Direct Plan - Growth", "MF120834",
                MutualFund.Category.HYBRID, "0.61", 3, "409.5500", "Canara Robeco Mutual Fund",
                "Hybrid allocation fund combining equity growth and debt stability.",
                "1000.0000");
    }

    private void seedFund(String schemeCode,
                          String fundName,
                          String tickerSymbol,
                          MutualFund.Category category,
                          String expenseRatio,
                          int riskRating,
                          String currentNav,
                          String fundManager,
                          String description,
                          String minInvestment) {
        MutualFund fund = MutualFund.builder()
                .externalSchemeCode(schemeCode)
                .fundName(fundName)
                .tickerSymbol(tickerSymbol)
                .category(category)
                .expenseRatio(new BigDecimal(expenseRatio))
                .riskRating(riskRating)
                .currentNav(new BigDecimal(currentNav))
                .fundManager(fundManager)
                .description(description)
                .minInvestment(new BigDecimal(minInvestment))
                .build();

        mutualFundRepository.save(fund);
    }
}
