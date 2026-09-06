package com.attendance.system.config;

import com.attendance.system.model.Admin;
import com.attendance.system.model.Faculty;
import com.attendance.system.model.Holiday;
import com.attendance.system.model.Notice;
import com.attendance.system.model.Student;
import com.attendance.system.repository.AdminRepository;
import com.attendance.system.repository.FacultyRepository;
import com.attendance.system.repository.HolidayRepository;
import com.attendance.system.repository.NoticeRepository;
import com.attendance.system.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * DataInitializer automatically seeds required default admin, faculty,
 * and student accounts if they are not already present in the database.
 * This guarantees smooth login out of the box.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final AdminRepository adminRepository;
    private final FacultyRepository facultyRepository;
    private final StudentRepository studentRepository;
    private final HolidayRepository holidayRepository;
    private final NoticeRepository noticeRepository;

    public DataInitializer(AdminRepository adminRepository,
                           FacultyRepository facultyRepository,
                           StudentRepository studentRepository,
                           HolidayRepository holidayRepository,
                           NoticeRepository noticeRepository) {
        this.adminRepository = adminRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.holidayRepository = holidayRepository;
        this.noticeRepository = noticeRepository;
    }

    @Override
    public void run(String... args) {
        logger.info("Checking and initializing system demo data...");
        seedAdmin();
        seedFaculty();
        seedStudents();
        seedHolidays();
        seedNotices();
        logger.info("Demo data verification complete.");
    }

    private void seedAdmin() {
        if (!adminRepository.existsByEmail("admin@attendance.edu")) {
            Admin admin = new Admin("System Administrator", "admin@attendance.edu", "admin123");
            adminRepository.save(admin);
            logger.info("Seeded default Admin: admin@attendance.edu / admin123");
        } else {
            logger.info("Default Admin already exists: admin@attendance.edu");
        }
    }

    private void seedFaculty() {
        List<Faculty> demoFaculty = Arrays.asList(
            new Faculty("Dr. Alan Turing", "alan.turing@attendance.edu", "faculty123", "Computer Science"),
            new Faculty("Prof. Ada Lovelace", "ada.lovelace@attendance.edu", "faculty456", "Information Technology"),
            new Faculty("Dr. Claude Shannon", "claude.shannon@attendance.edu", "faculty789", "Electronics & Communication")
        );

        for (Faculty f : demoFaculty) {
            if (!facultyRepository.existsByEmail(f.getEmail())) {
                facultyRepository.save(f);
                logger.info("Seeded demo Faculty: {} ({})", f.getName(), f.getEmail());
            }
        }
    }

    private void seedStudents() {
        List<Student> demoStudents = Arrays.asList(
            new Student("CS2026001", "Alice Johnson", "alice.johnson@student.edu", "student123", "Computer Science", 3, "A", "9876543210", "https://images.unsplash.com/photo-1494790108377-be9c29b29330"),
            new Student("CS2026002", "Bob Smith", "bob.smith@student.edu", "student123", "Computer Science", 3, "A", "9876543211", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"),
            new Student("CS2026003", "Charlie Brown", "charlie.brown@student.edu", "student123", "Computer Science", 3, "B", "9876543212", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e"),
            new Student("CS2026004", "Diana Prince", "diana.prince@student.edu", "student123", "Computer Science", 2, "A", "9876543213", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"),
            new Student("IT2026005", "Evan Wright", "evan.wright@student.edu", "student123", "Information Technology", 2, "A", "9876543214", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"),
            new Student("IT2026006", "Fiona Gallagher", "fiona.gallagher@student.edu", "student123", "Information Technology", 4, "B", "9876543215", "https://images.unsplash.com/photo-1544005313-94ddf0286df2"),
            new Student("EC2026007", "George Clark", "george.clark@student.edu", "student123", "Electronics & Communication", 1, "A", "9876543216", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"),
            new Student("EC2026008", "Hannah Abbott", "hannah.abbott@student.edu", "student123", "Electronics & Communication", 1, "B", "9876543217", "https://images.unsplash.com/photo-1517841905240-472988babdf9"),
            new Student("CS2026009", "Ian Malcolm", "ian.malcolm@student.edu", "student123", "Computer Science", 4, "A", "9876543218", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d"),
            new Student("IT2026010", "Julia Roberts", "julia.roberts@student.edu", "student123", "Information Technology", 3, "A", "9876543219", "https://images.unsplash.com/photo-1534528741775-53994a69daeb")
        );

        for (Student s : demoStudents) {
            if (!studentRepository.existsByEmail(s.getEmail()) && !studentRepository.existsByRollNumber(s.getRollNumber())) {
                studentRepository.save(s);
                logger.info("Seeded demo Student: {} ({})", s.getName(), s.getEmail());
            }
        }
    }

    private void seedHolidays() {
        if (holidayRepository.count() == 0) {
            Admin admin = adminRepository.findByEmail("admin@attendance.edu").orElse(null);
            holidayRepository.save(new Holiday(LocalDate.of(2026, 1, 26), "Republic Day", "National holiday commemorating Constitution of India", admin));
            holidayRepository.save(new Holiday(LocalDate.of(2026, 8, 15), "Independence Day", "National Independence Day celebrations", admin));
            holidayRepository.save(new Holiday(LocalDate.of(2026, 10, 2), "Gandhi Jayanti", "Mahatma Gandhi Birthday", admin));
            holidayRepository.save(new Holiday(LocalDate.of(2026, 11, 8), "Diwali", "Festival of Lights - Campus closed", admin));
            holidayRepository.save(new Holiday(LocalDate.of(2026, 12, 25), "Christmas Day", "Winter Break & Christmas celebration", admin));
            logger.info("Seeded 5 demo holidays.");
        }
    }

    private void seedNotices() {
        if (noticeRepository.count() == 0) {
            Faculty f1 = facultyRepository.findByEmail("alan.turing@attendance.edu").orElse(null);
            Faculty f2 = facultyRepository.findByEmail("ada.lovelace@attendance.edu").orElse(null);
            Faculty f3 = facultyRepository.findByEmail("claude.shannon@attendance.edu").orElse(null);

            noticeRepository.save(new Notice("Mid-Semester Examination Schedule", "The mid-semester timetable has been finalized and released.", f1, "All"));
            noticeRepository.save(new Notice("Data Structures Lab Session Rescheduled", "CS 3rd Year Section A lab session on Friday rescheduled to Saturday 10:00 AM.", f1, "Specific Section"));
            noticeRepository.save(new Notice("Annual Inter-College Hackathon 2026", "Registrations are now open for the annual coding hackathon.", f2, "All"));
            noticeRepository.save(new Notice("Final Year Project Synopsis Deadline", "All 4th-year students must submit project synopses by September 15th.", f2, "Specific Year"));
            noticeRepository.save(new Notice("Guest Lecture on Quantum Computing", "Dr. Neil Croft presents on quantum computing this Thursday at 2 PM.", f3, "All"));
            logger.info("Seeded 5 demo notices.");
        }
    }
}
