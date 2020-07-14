import { readFileSync } from 'fs';
import { send } from './email';

function readCSV(fileName: string): string[][] {
  const rows = readFileSync(fileName).toString().trim().split('\n');
  rows.splice(0, 1);
  return rows.map(row => row.trim().split(','));
}

const students = readCSV('students.csv');
const teachers = readCSV('teachers.csv');

async function sendStudentEmails() {
  for (const student of students) {
    console.log(
      student[2].split(' ')?.[0] ?? '',
      student[3],
      student[6],
      student[7]
    );

    // console.log(await send(student[3], '[Please read] Important information for CodeLM 2020', {
    //     templateName: 'info',
    //     firstName: student[2].split(' ')?.[0] ?? '',
    //     username: student[6],
    //     password: student[7],
    // }));

    // console.log(await send(student[3], '[Reminder] CodeLM 2020', {
    //     templateName: 'reminder',
    //     firstName: student[2].split(' ')?.[0] ?? '',
    // }));

    console.log(
      await send(student[3], 'CodeLM 2020 Wrap-up', {
        templateName: 'wrapup',
        firstName: student[2].split(' ')?.[0] ?? '',
      })
    );
  }
}

async function sendTeacherEmails() {
  for (const teacher of teachers) {
    const myStudents: string[][] = [];

    for (const student of students) {
      if (teacher[1] === student[1]) {
        // Same school
        myStudents.push(student);
      }
    }

    if (myStudents.length === 0) {
      continue;
    }

    console.log(
      teacher[3],
      teacher[2].split(' ')?.[0] ?? '',
      myStudents.length
    );

    console.log(
      await send(
        teacher[3],
        '[Please read] Important information for CodeLM 2020',
        {
          templateName: 'info-teachers',
          firstName: teacher[2].split(' ')?.[0] ?? '',
        },
        {
          filename: 'accounts.csv',
          contentType: 'text/csv',
          data:
            'name,email address,division,username,password\n' +
            myStudents
              .map(row =>
                row
                  .filter((_, index) => [2, 3, 5, 6, 7].includes(index))
                  .join(',')
              )
              .join('\n'),
        }
      )
    );
  }
}

// sendStudentEmails();
// sendTeacherEmails();
