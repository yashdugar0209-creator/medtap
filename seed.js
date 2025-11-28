// seed.js - create sample patients, records, and a sample patient user
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite3'));

async function seed() {
  db.serialize(async () => {
    // tables already created in server.js but safe to run
    db.run(`CREATE TABLE IF NOT EXISTS patients (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT UNIQUE, name TEXT, dob TEXT, gender TEXT, mobile TEXT, email TEXT, address TEXT, city TEXT, state TEXT, pincode TEXT, aadhaar TEXT, pan TEXT, insurance_provider TEXT, insurance_number TEXT, insurance_validity TEXT, ayushman_number TEXT, blood_group TEXT, allergies TEXT, chronic_conditions TEXT, medications TEXT, emergency_contact TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER, type TEXT, title TEXT, content TEXT, file TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT, token_linked TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

    db.run(`INSERT OR IGNORE INTO patients (token,name,dob,gender,mobile,email,address,city,state,pincode,aadhaar,pan,insurance_provider,insurance_number,insurance_validity,blood_group,allergies,medical_history,medications,emergency_contact)
      VALUES ('TOKEN123','Rajesh Patel','1980-05-12','Male','9999999999','rajesh@example.com','123 MG Road','Ahmedabad','Gujarat','380001','111122223333','ABCDE1234F','SBI General','POL12345','2026-12-31','B+','None','Diabetes','Metformin 500mg','9999999999')`);

    db.run(`INSERT OR IGNORE INTO records (patient_id,type,title,content) VALUES (1,'Prescription','Diabetes Rx','Metformin 500mg - 1 tab twice daily')`);
    db.run(`INSERT OR IGNORE INTO records (patient_id,type,title,content) VALUES (1,'Report','Blood Test','HbA1c 7.2%')`);

    const hash = await bcrypt.hash('password123', 10);
    db.run(`INSERT OR IGNORE INTO users (email,password,token_linked) VALUES ('user@example.com', ?, 'TOKEN123')`, [hash], function (err) {
      if (err) console.error(err.message);
      else console.log('Created sample patient user: user@example.com / password123 (linked to TOKEN123)');
      db.close();
    });
  });
}

if (require.main === module) seed();
module.exports = seed;
