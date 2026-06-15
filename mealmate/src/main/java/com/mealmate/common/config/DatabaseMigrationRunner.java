package com.mealmate.common.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE fridge_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50)");
            System.out.println("Database migration: Added 'unit' column to 'fridge_items' table if it did not exist.");
        } catch (Exception e) {
            System.err.println("Database migration failed: " + e.getMessage());
        }
    }
}
