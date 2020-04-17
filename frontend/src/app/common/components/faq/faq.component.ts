import { Component } from '@angular/core';

interface QA {
  question: string;
  answer: string;
}

interface Topic {
  title: string;
  questions: QA[];
}

class Faq {
  topics: Topic[];

  constructor(data: {[topic: string]: { [question: string]: string }}) {
    this.topics = Object.keys(data).map(topic => ({title: topic, questions: Object.keys(data[topic]).map(question => ({question, answer: data[topic][question]}))}));
  }
}

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  faq = new Faq({
    'General': {
      'What is CodeLM?': 'CodeLM is a programming competition founded at Lower Merion High School. Competitors ' +
        'complete a variety of algorithm challenges to rack up points and win prizes.',
      'What is New Wave Computers?': 'New Wave Computers is our fictitious computer company that always seems to be ' +
        'in need of help. The algorithms you implement during the competition will help solve New Wave\'s problems.',
    },
    'Competition': {
      'When is the competition?': 'The competition will be on April 17th from 12 pm to 3 pm.',
      'How do I register for the competition?': 'Ask your teacher to either register you or provide you with the ' +
        'registration link. The Register button on the dashboard is only for registering for practice (see below).',
      'Will I work alone or on a team?': 'While CodeLM is usually a team-based event, we will have all competitors ' +
        'compete alone in their own homes this year to promote social distancing.',
      'Where is the competition?': 'This year\'s competition will be online. The opening and closing presentations ' +
        'will be delivered over Zoom, and competitors will solve problems in their own homes to promote social ' +
        'distancing. More information will be announced closer to the event.',
      'How long will the competition last?': 'The competition will last two hours, with a 30 minute opening ' +
        'presentation and a 30 minute closing presentation.',
      'How many questions are there?': 'There will be 10 questions. Competitors are not expected to solve all 10, ' +
        'but we\'ll be impressed if you do!',
    },
    'Practice': {
      'How can I practice for the competition?': 'You can register a practice account and get access to last year\'s ' +
        'problems. This will let you practice with the CodeLM dashboard and the types of problems you\'ll see in the ' +
        'real event. To register a practice account, click the Register button on the login page, choose a username ' +
        'and password, enter your name as you registered for the event, and click the Register button. Once you\'re ' +
        'in the dashboard, click the Download Starter Code button to get the starter code. Then, use the starter ' +
        'code for your preferred language to solve the problems!',
      'How similar are the practice problems to the real problems?': 'The practice problems are the exact problems ' +
        'used in last year\'s competition, so you can expect a similar format and level of difficulty in this ' +
        'year\'s problem set.',
      'What if I run into an issue?': 'First, check this FAQ again to see if an update has been posted. If not, send ' +
        'an email to team@newwavecomputers.com describing your issue.',
    },
  });
}
