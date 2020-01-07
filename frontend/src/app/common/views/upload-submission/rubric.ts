interface RubricItem {
  category: string;
  0: string;
  1: string;
  2: string;
}

export const rubric: RubricItem[] = [
  {
    category: 'Function',
    0: 'A program solution is submitted but fails to compile. \n' +
      '– or –\n' +
      'The submitted program compiles \n' +
      'successfully. \n' +
      '•\n' +
      'The program does not attempt to play the game.',
    1: '\n' +
      'The submitted program compiles \n' +
      'successfully.\n' +
      '•\n' +
      'The submitted program includes run-time and/or logic errors that result in incorrect output.\n' +
      '•\n' +
      'Implementation is incomplete.',
    2: 'The submitted program compiles \n' +
      'successfully. \n' +
      '•\n' +
      'The submitted program is free of run-time and logic errors.\n' +
      '•\n' +
      'Your code fully implements a valid algorithm for playing the game.'
  },
  {
    category: 'Code Readability',
    0: 'Code contains no documentation.\n' +
      '•\n' +
      'Code is unformatted and is difficult to read.\n' +
      '•\n' +
      '  Variables are ambiguous (i.e. x) and do not indicate the purpose of the variable.',
    1: 'The submitted solution is inconsistently documented.\n' +
      '•\n' +
      ' Code is inconsistently formatted and can be difficult to read.\n' +
      '•\n' +
      ' Numerous variables are ambiguous (i.e. x) and do not indicate the purpose of the variable.',
    2: 'The submitted solution is well documented.\n' +
      '•\n' +
      ' Code is properly formatted (i.e. indentation within brackets and appropriate spacing) and is easy to read.\n' +
      '•\n' +
      ' All variables are self-documented (i.e. named in a way that the name indicated the purpose of the variable).'
  },
  {
    category: 'Design',
    0: 'Code shows little to no thought about design.  \n' +
      '•\n' +
      'Structures and data types are poorly chose.',
    1: 'Code shows some thought about design.\n' +
      '•\n' +
      '  Appropriate structures are often used but not consistently throughout the program.',
    2: 'The program effectively chooses \n' +
      'and implements concepts that would best model and solve the problem.\n' +
      '•\n' +
      'Appropriate data types are chosen for all variables.\n' +
      '•\n' +
      'Code uses the most appropriate structures (i.e. if, else if, else, methods and loops.)'
  },
  {
    category: 'Algorithm',
    0: 'Your program does attempt to play the game; however, it does so with very little accuracy or thought. It does not take past feedback into account when making its next guess.',
    1: 'Your algorithm plays the game based on the feedback from the last guess.\n' +
      '•\n' +
      'Your algorithm shows some thought and design.\n',
    2: 'Your algorithm plays the game based on the feedback from several past guesses.\n' +
      '•\n' +
      'Your algorithm shows that it has been well thought out and designed.\n'
  }
];
