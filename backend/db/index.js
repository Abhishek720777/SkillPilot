const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new Database(path.join(__dirname, 'quizbattle.db'));
db.pragma('journal_mode = WAL');

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_color TEXT DEFAULT '#4F46E5',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '📚'
    );

    CREATE TABLE IF NOT EXISTS subtopics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subtopic_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      difficulty TEXT DEFAULT 'medium',
      explanation TEXT,
      FOREIGN KEY (subtopic_id) REFERENCES subtopics(id)
    );

    CREATE TABLE IF NOT EXISTS quiz_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      topic_id INTEGER NOT NULL,
      subtopic_id INTEGER NOT NULL,
      num_questions INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      total INTEGER NOT NULL,
      time_taken INTEGER DEFAULT 0,
      questions_data TEXT,
      answers_data TEXT,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS user_question_history (
      user_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      PRIMARY KEY (user_id, question_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    );

    CREATE TABLE IF NOT EXISTS battles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      room_code TEXT UNIQUE NOT NULL,
      creator_id INTEGER NOT NULL,
      joiner_id INTEGER,
      topic_id INTEGER NOT NULL,
      subtopic_id INTEGER,
      difficulty TEXT DEFAULT 'medium',
      num_questions INTEGER NOT NULL,
      timer_seconds INTEGER NOT NULL,
      status TEXT DEFAULT 'waiting',
      questions_data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id),
      FOREIGN KEY (joiner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS battle_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      battle_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      score INTEGER DEFAULT 0,
      time_taken INTEGER DEFAULT 0,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (battle_id) REFERENCES battles(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      read_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    );
  `);

  const topicCount = db.prepare('SELECT COUNT(*) as count FROM topics').get();
  if (topicCount.count === 0) {
    seedData();
  }
}

function seedData() {
  const insertTopic = db.prepare('INSERT INTO topics (name, icon) VALUES (?, ?)');
  const insertSubtopic = db.prepare('INSERT INTO subtopics (topic_id, name) VALUES (?, ?)');
  const insertQuestion = db.prepare('INSERT INTO questions (subtopic_id, question, options, correct_answer, difficulty, explanation) VALUES (?, ?, ?, ?, ?, ?)');

  const topics = [
    { name: 'Java', icon: '☕' },
    { name: 'Python', icon: '🐍' },
    { name: 'Database', icon: '🗄️' },
    { name: 'Aptitude', icon: '🧠' },
  ];

  const allSubtopics = {
    Java: ['OOP', 'Collections', 'Exceptions'],
    Python: ['Basics', 'OOP', 'Data Structures'],
    Database: ['SQL Joins', 'Indexing', 'Normalization'],
    Aptitude: ['Quantitative', 'Logical Reasoning'],
  };

  const questions = {
    'Java-OOP': [
      { q: 'Which keyword is used to achieve inheritance in Java?', opts: ['implements', 'extends', 'inherits', 'super'], ans: 1, diff: 'easy', exp: '"extends" keyword is used to inherit from a parent class in Java.' },
      { q: 'What is encapsulation in OOP?', opts: ['Hiding implementation details behind a public interface', 'Creating multiple objects', 'Inheriting from a base class', 'Overloading methods'], ans: 0, diff: 'easy', exp: 'Encapsulation bundles data and methods and restricts direct access to the internal state.' },
      { q: 'Which of the following is NOT a pillar of OOP?', opts: ['Encapsulation', 'Compilation', 'Polymorphism', 'Abstraction'], ans: 1, diff: 'easy', exp: 'The four pillars of OOP are Encapsulation, Abstraction, Inheritance, and Polymorphism.' },
      { q: 'What does the "final" keyword do when applied to a class?', opts: ['Makes it abstract', 'Prevents instantiation', 'Prevents inheritance', 'Makes all methods static'], ans: 2, diff: 'medium', exp: 'A final class cannot be subclassed/extended.' },
      { q: 'Which concept allows a subclass to provide a specific implementation of a method already defined in its parent class?', opts: ['Overloading', 'Overriding', 'Abstraction', 'Encapsulation'], ans: 1, diff: 'medium', exp: 'Method overriding allows a subclass to provide its own implementation of an inherited method.' },
      { q: 'What is the output of calling a method with the same name but different parameters?', opts: ['Compile error', 'Runtime error', 'Method overloading', 'Method overriding'], ans: 2, diff: 'easy', exp: 'Method overloading allows multiple methods with the same name but different parameters.' },
      { q: 'Which access modifier makes a class member accessible only within the same class?', opts: ['public', 'protected', 'private', 'default'], ans: 2, diff: 'easy', exp: 'private members are accessible only within the declaring class.' },
      { q: 'What is an abstract class?', opts: ['A class with only static methods', 'A class that cannot have constructors', 'A class that may have abstract methods and cannot be instantiated directly', 'A class with no methods'], ans: 2, diff: 'medium', exp: 'Abstract classes can have both abstract and concrete methods and cannot be instantiated directly.' },
      { q: 'In Java, can a class implement multiple interfaces?', opts: ['No, only one', 'Yes, multiple interfaces', 'Only if they share methods', 'Only abstract classes can'], ans: 1, diff: 'easy', exp: 'Java supports multiple interface implementation, which provides a form of multiple inheritance.' },
      { q: 'What is the "super" keyword used for?', opts: ['To call a subclass method', 'To reference the current class', 'To call parent class constructor or methods', 'To create a new object'], ans: 2, diff: 'medium', exp: '"super" refers to the parent class and can call its constructors and methods.' },
      { q: 'Which type of polymorphism is resolved at runtime?', opts: ['Static polymorphism', 'Compile-time polymorphism', 'Dynamic/Runtime polymorphism', 'Method overloading'], ans: 2, diff: 'medium', exp: 'Dynamic polymorphism (method overriding) is resolved at runtime via virtual method dispatch.' },
      { q: 'What is a constructor?', opts: ['A method that returns an object', 'A special method called when an object is created', 'A static initializer block', 'A method used for garbage collection'], ans: 1, diff: 'easy', exp: 'A constructor is called automatically when an object is instantiated.' },
      { q: 'Can an abstract class have a constructor in Java?', opts: ['No', 'Yes', 'Only if it has no abstract methods', 'Only if it is also final'], ans: 1, diff: 'hard', exp: 'Abstract classes can have constructors, called via super() from subclass constructors.' },
      { q: 'What is the difference between an interface and an abstract class?', opts: ['Interfaces can have constructors, abstract classes cannot', 'Abstract classes can have state/fields; interfaces traditionally cannot (before Java 8)', 'Interfaces support single inheritance only', 'There is no difference'], ans: 1, diff: 'hard', exp: 'Abstract classes can have instance variables; interfaces are fully abstract (though Java 8+ allows default methods).' },
      { q: 'Which OOP concept is demonstrated by a method behaving differently based on the object it is called on?', opts: ['Inheritance', 'Encapsulation', 'Polymorphism', 'Abstraction'], ans: 2, diff: 'medium', exp: 'Polymorphism allows a single interface to represent different underlying data types.' },
    ],
    'Java-Collections': [
      { q: 'Which collection does NOT allow duplicate elements?', opts: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'], ans: 2, diff: 'easy', exp: 'HashSet implements Set, which does not allow duplicates.' },
      { q: 'Which interface does ArrayList implement?', opts: ['Set', 'Map', 'List', 'Queue'], ans: 2, diff: 'easy', exp: 'ArrayList implements the List interface.' },
      { q: 'What is the time complexity of get() in a HashMap?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n log n)'], ans: 2, diff: 'medium', exp: 'HashMap provides O(1) average time for get() using hashing.' },
      { q: 'Which collection maintains insertion order?', opts: ['HashSet', 'TreeSet', 'LinkedHashSet', 'HashMap'], ans: 2, diff: 'medium', exp: 'LinkedHashSet maintains insertion order unlike HashSet.' },
      { q: 'What does TreeMap sort by?', opts: ['Insertion order', 'Value', 'Key in natural order', 'Random order'], ans: 2, diff: 'medium', exp: 'TreeMap sorts entries by key in ascending natural order.' },
      { q: 'Which of the following is thread-safe?', opts: ['ArrayList', 'HashMap', 'HashSet', 'Vector'], ans: 3, diff: 'medium', exp: 'Vector is synchronized and thread-safe, unlike ArrayList.' },
      { q: 'What does the Iterator pattern allow you to do?', opts: ['Sort a collection', 'Traverse elements without exposing the underlying structure', 'Search in O(1)', 'Prevent modification during traversal'], ans: 1, diff: 'medium', exp: 'Iterator provides a uniform way to traverse elements of a collection.' },
      { q: 'Which collection would you use for a FIFO queue?', opts: ['Stack', 'ArrayDeque', 'TreeSet', 'LinkedHashMap'], ans: 1, diff: 'medium', exp: 'ArrayDeque or LinkedList are efficient FIFO queue implementations.' },
      { q: 'What is the initial capacity of an ArrayList in Java?', opts: ['5', '10', '16', '8'], ans: 1, diff: 'hard', exp: 'The default initial capacity of ArrayList is 10.' },
      { q: 'What exception is thrown when modifying a collection during iteration?', opts: ['IndexOutOfBoundsException', 'ConcurrentModificationException', 'IllegalStateException', 'NullPointerException'], ans: 1, diff: 'medium', exp: 'ConcurrentModificationException is thrown when a collection is structurally modified during iteration.' },
      { q: 'Which data structure does LinkedList implement?', opts: ['Doubly linked list', 'Singly linked list', 'Circular linked list', 'Binary tree'], ans: 0, diff: 'easy', exp: 'Java LinkedList is a doubly linked list.' },
      { q: 'What does Collections.unmodifiableList() return?', opts: ['A sorted list', 'A thread-safe list', 'A read-only view of the list', 'A reversed list'], ans: 2, diff: 'medium', exp: 'It returns an unmodifiable view; modification attempts throw UnsupportedOperationException.' },
      { q: 'What is the difference between HashMap and Hashtable?', opts: ['HashMap allows null keys; Hashtable does not', 'Hashtable is faster', 'HashMap is synchronized', 'No difference'], ans: 0, diff: 'hard', exp: 'HashMap allows null keys/values and is not synchronized; Hashtable is synchronized and does not allow null keys.' },
      { q: 'Which method removes all elements from a List?', opts: ['delete()', 'removeAll()', 'clear()', 'flush()'], ans: 2, diff: 'easy', exp: 'clear() removes all elements from the list.' },
      { q: 'PriorityQueue in Java orders elements by:', opts: ['Insertion order', 'Natural ordering or Comparator', 'Reverse alphabetical', 'Random'], ans: 1, diff: 'medium', exp: 'PriorityQueue orders elements by natural ordering or a provided Comparator.' },
    ],
    'Java-Exceptions': [
      { q: 'Which class is the root of all exceptions in Java?', opts: ['Error', 'Exception', 'Throwable', 'RuntimeException'], ans: 2, diff: 'easy', exp: 'Throwable is the superclass of all errors and exceptions.' },
      { q: 'What is the difference between checked and unchecked exceptions?', opts: ['Checked exceptions are subclasses of RuntimeException', 'Unchecked exceptions must be declared or caught', 'Checked exceptions must be declared or caught; unchecked need not be', 'There is no difference'], ans: 2, diff: 'medium', exp: 'Checked exceptions (e.g., IOException) must be handled; unchecked (e.g., NullPointerException) need not be.' },
      { q: 'Which block is always executed regardless of whether an exception is thrown?', opts: ['try', 'catch', 'finally', 'throws'], ans: 2, diff: 'easy', exp: 'The finally block always executes, used for cleanup code.' },
      { q: 'Which of these is an unchecked exception?', opts: ['IOException', 'SQLException', 'NullPointerException', 'ClassNotFoundException'], ans: 2, diff: 'easy', exp: 'NullPointerException extends RuntimeException and is unchecked.' },
      { q: 'What keyword is used to manually throw an exception?', opts: ['throws', 'throw', 'catch', 'raise'], ans: 1, diff: 'easy', exp: '"throw" is used to explicitly throw an exception.' },
      { q: 'What does the "throws" keyword in a method signature indicate?', opts: ['The method catches exceptions', 'The method may throw those exceptions', 'The method ignores exceptions', 'The method handles all exceptions'], ans: 1, diff: 'easy', exp: '"throws" declares that a method may throw specific exceptions.' },
      { q: 'Can you catch multiple exceptions in a single catch block?', opts: ['No', 'Yes, using | operator (Java 7+)', 'Only for RuntimeExceptions', 'Only for checked exceptions'], ans: 1, diff: 'medium', exp: 'Since Java 7, you can use multi-catch: catch (IOException | SQLException e)' },
      { q: 'What happens if an exception is thrown in the finally block?', opts: ['It is ignored', 'The original exception is suppressed', 'Both exceptions propagate', 'The program terminates immediately'], ans: 1, diff: 'hard', exp: 'An exception thrown in finally suppresses the original exception.' },
      { q: 'Which exception is thrown when dividing by zero in integer arithmetic?', opts: ['ArithmeticException', 'NumberFormatException', 'IllegalArgumentException', 'MathException'], ans: 0, diff: 'easy', exp: 'Integer division by zero throws ArithmeticException: / by zero.' },
      { q: 'How do you create a custom exception class?', opts: ['Implement Runnable', 'Extend Exception or RuntimeException', 'Implement Throwable', 'Annotate with @Exception'], ans: 1, diff: 'medium', exp: 'Custom exceptions are created by extending Exception (checked) or RuntimeException (unchecked).' },
      { q: 'What is try-with-resources?', opts: ['A way to catch multiple exceptions', 'Automatically closes resources that implement AutoCloseable', 'A retry mechanism', 'A way to suppress exceptions'], ans: 1, diff: 'medium', exp: 'try-with-resources automatically closes resources after the try block, introduced in Java 7.' },
      { q: 'Which exception is thrown when casting to an incompatible type?', opts: ['NullPointerException', 'ClassCastException', 'IllegalArgumentException', 'TypeMismatchException'], ans: 1, diff: 'medium', exp: 'ClassCastException is thrown when an invalid cast is attempted.' },
      { q: 'What is the difference between Error and Exception?', opts: ['No difference', 'Errors are for serious problems not expected to be caught; Exceptions are for application-level issues', 'Exceptions are uncatchable', 'Errors must always be caught'], ans: 1, diff: 'medium', exp: 'Errors (e.g., OutOfMemoryError) indicate serious JVM issues; Exceptions are application-level problems.' },
      { q: 'Which exception is thrown when a thread tries to access an object it has no lock on?', opts: ['ThreadException', 'IllegalMonitorStateException', 'ConcurrentException', 'SyncException'], ans: 1, diff: 'hard', exp: 'IllegalMonitorStateException is thrown when wait()/notify() is called without owning the object\'s monitor.' },
      { q: 'Can a finally block prevent an exception from propagating?', opts: ['No', 'Yes, by using return statement or throwing a new exception', 'Only for checked exceptions', 'Only inside loops'], ans: 1, diff: 'hard', exp: 'A return statement or new exception in finally suppresses the original exception propagation.' },
    ],
    'Python-Basics': [
      { q: 'What is the correct way to comment a single line in Python?', opts: ['// comment', '/* comment */', '# comment', '-- comment'], ans: 2, diff: 'easy', exp: 'Python uses # for single-line comments.' },
      { q: 'Which data type is mutable in Python?', opts: ['tuple', 'string', 'int', 'list'], ans: 3, diff: 'easy', exp: 'Lists are mutable; tuples, strings, and ints are immutable.' },
      { q: 'What does "len([1,2,3])" return?', opts: ['2', '3', '4', 'Error'], ans: 1, diff: 'easy', exp: 'len() returns the number of items; [1,2,3] has 3 items.' },
      { q: 'What is the output of "print(type(5.0))"?', opts: ['<class int>', '<class float>', '<class double>', '<class number>'], ans: 1, diff: 'easy', exp: '5.0 is a float literal in Python.' },
      { q: 'Which operator is used for floor division?', opts: ['/', '%', '//', '**'], ans: 2, diff: 'easy', exp: '// performs floor division, e.g., 7 // 2 = 3.' },
      { q: 'How do you check if a key exists in a Python dict?', opts: ['"key" in dict', 'dict.has("key")', 'dict.contains("key")', 'dict.exists("key")'], ans: 0, diff: 'easy', exp: 'Use the "in" operator: "key" in dict.' },
      { q: 'What does the "pass" statement do?', opts: ['Exits a loop', 'Skips the current iteration', 'Does nothing; acts as a placeholder', 'Passes a value to a function'], ans: 2, diff: 'easy', exp: '"pass" is a no-op placeholder for empty blocks.' },
      { q: 'What is a lambda function?', opts: ['A named function with multiple statements', 'An anonymous single-expression function', 'A recursive function', 'A built-in function'], ans: 1, diff: 'medium', exp: 'Lambda creates small anonymous functions: lambda x: x*2' },
      { q: 'What is the output of "2 ** 3"?', opts: ['6', '9', '8', '5'], ans: 2, diff: 'easy', exp: '** is the exponentiation operator; 2^3 = 8.' },
      { q: 'Which function converts a string to an integer?', opts: ['str()', 'float()', 'int()', 'num()'], ans: 2, diff: 'easy', exp: 'int("42") converts the string "42" to the integer 42.' },
      { q: 'What is the difference between "==" and "is" in Python?', opts: ['They are identical', '"==" compares values; "is" compares identity/memory address', '"is" compares values; "==" compares identity', '"is" is used for type checking'], ans: 1, diff: 'medium', exp: '"==" checks value equality; "is" checks if both refer to the same object in memory.' },
      { q: 'What does list[-1] access?', opts: ['First element', 'Last element', 'Second to last', 'Raises IndexError'], ans: 1, diff: 'easy', exp: 'Negative indexing in Python: -1 accesses the last element.' },
      { q: 'Which keyword is used to define a generator function?', opts: ['return', 'yield', 'generate', 'async'], ans: 1, diff: 'medium', exp: '"yield" makes a function a generator, producing values lazily.' },
      { q: 'What is a Python decorator?', opts: ['A comment style', 'A function that wraps another function to modify its behavior', 'A class attribute', 'A module-level constant'], ans: 1, diff: 'medium', exp: 'Decorators use @syntax to wrap functions, adding behavior before/after.' },
      { q: 'What does "enumerate" do?', opts: ['Returns only values of a list', 'Returns index-value pairs while iterating', 'Sorts the list', 'Counts occurrences'], ans: 1, diff: 'medium', exp: 'enumerate(iterable) returns (index, value) pairs on each iteration.' },
    ],
    'Python-OOP': [
      { q: 'How is a class defined in Python?', opts: ['class MyClass:', 'def MyClass():', 'object MyClass:', 'new class MyClass:'], ans: 0, diff: 'easy', exp: 'Python uses "class ClassName:" to define a class.' },
      { q: 'What is the role of __init__ in Python?', opts: ['It destroys an object', 'It is the constructor called when an object is created', 'It returns a string representation', 'It makes the class iterable'], ans: 1, diff: 'easy', exp: '__init__ is the initializer (constructor) called when an instance is created.' },
      { q: 'What does "self" refer to in a method?', opts: ['The class itself', 'The parent class', 'The current instance of the class', 'A global variable'], ans: 2, diff: 'easy', exp: '"self" is a reference to the current object instance.' },
      { q: 'How do you define a class method?', opts: ['Using @staticmethod', 'Using @classmethod with cls as first param', 'Using @method decorator', 'Using "class" before def'], ans: 1, diff: 'medium', exp: '@classmethod takes "cls" as first argument and operates on the class rather than an instance.' },
      { q: 'What is method resolution order (MRO)?', opts: ['The order in which Python searches for methods in class hierarchy', 'The order of decorators applied', 'The memory layout of a class', 'The order of attribute initialization'], ans: 0, diff: 'hard', exp: 'MRO determines the order Python looks up methods, following C3 linearization algorithm.' },
      { q: 'What does __str__ define?', opts: ['How to compare objects', 'The string representation of an object', 'How to hash an object', 'The memory address'], ans: 1, diff: 'easy', exp: '__str__ defines what str(obj) and print(obj) return.' },
      { q: 'How do you make an attribute "private" in Python?', opts: ['Using private keyword', 'Using __ prefix (name mangling)', 'Using @private decorator', 'You cannot; Python has no private attributes'], ans: 1, diff: 'medium', exp: 'Double underscore prefix (__attr) triggers name mangling, making it harder to access from outside.' },
      { q: 'What is multiple inheritance?', opts: ['A class with multiple methods', 'A class inheriting from more than one parent class', 'Multiple instances of the same class', 'A class with multiple constructors'], ans: 1, diff: 'medium', exp: 'Python supports multiple inheritance: class C(A, B):' },
      { q: 'What is the @property decorator used for?', opts: ['To define a class method', 'To create read-only attributes or getters', 'To make a method static', 'To override a parent method'], ans: 1, diff: 'medium', exp: '@property allows a method to be accessed like an attribute, enabling getter/setter patterns.' },
      { q: 'What does __repr__ return?', opts: ['A formal string useful for debugging', 'The hash of the object', 'The type of the object', 'True if the object is real'], ans: 0, diff: 'medium', exp: '__repr__ returns an unambiguous string representation for developers, used by repr().' },
      { q: 'What is duck typing in Python?', opts: ['A design pattern for type checking', 'An object\'s type is determined by its behavior, not its class', 'Using type hints everywhere', 'Enforcing strict types'], ans: 1, diff: 'medium', exp: '"If it walks like a duck and quacks like a duck, it\'s a duck." Python cares about methods, not types.' },
      { q: 'What does super() do in Python?', opts: ['Creates a copy of the current object', 'Returns the parent class object for delegating method calls', 'Makes a method static', 'Calls all parent constructors simultaneously'], ans: 1, diff: 'medium', exp: 'super() provides access to parent class methods, commonly used in __init__.' },
      { q: 'What is an abstract base class (ABC)?', opts: ['A class with no methods', 'A class that cannot be instantiated and defines interface for subclasses', 'A class with only class methods', 'A class that inherits from all other classes'], ans: 1, diff: 'medium', exp: 'ABC from the "abc" module defines abstract methods that subclasses must implement.' },
      { q: 'What is a mixin in Python OOP?', opts: ['A class meant to be inherited to add functionality without being a base class', 'A method that mixes two objects', 'A type of decorator', 'A built-in Python module'], ans: 0, diff: 'hard', exp: 'Mixins are classes designed to be mixed into other classes to add specific functionality.' },
      { q: 'Which method is called when an object is deleted?', opts: ['__remove__', '__delete__', '__del__', '__destroy__'], ans: 2, diff: 'medium', exp: '__del__ is the destructor called when the object is about to be garbage collected.' },
    ],
    'Python-Data Structures': [
      { q: 'What is a Python dictionary?', opts: ['An ordered sequence of items', 'A collection of key-value pairs', 'An immutable sequence', 'A sorted collection'], ans: 1, diff: 'easy', exp: 'A dict is a mutable collection of key-value pairs.' },
      { q: 'What is the time complexity of appending to a Python list?', opts: ['O(n)', 'O(log n)', 'O(1) amortized', 'O(n²)'], ans: 2, diff: 'medium', exp: 'List append is O(1) amortized due to dynamic array resizing.' },
      { q: 'Which Python structure is used as a stack?', opts: ['dict', 'list with append/pop', 'tuple', 'set'], ans: 1, diff: 'easy', exp: 'A list can act as a stack using append() to push and pop() to pull from end.' },
      { q: 'What does the collections.deque offer over a list?', opts: ['More memory', 'O(1) append and pop from both ends', 'Thread safety', 'Automatic sorting'], ans: 1, diff: 'medium', exp: 'deque provides O(1) operations at both ends; list is O(n) for left-end operations.' },
      { q: 'What is a frozenset?', opts: ['A set that auto-sorts', 'An immutable version of a set', 'A set that allows duplicates', 'A set stored in a file'], ans: 1, diff: 'medium', exp: 'frozenset is an immutable, hashable version of set.' },
      { q: 'How do you implement a queue in Python?', opts: ['Using list with append/pop(0)', 'Using collections.deque with append/popleft', 'Both are equivalent', 'Using a tuple'], ans: 1, diff: 'medium', exp: 'deque.popleft() is O(1) vs list.pop(0) which is O(n).' },
      { q: 'What is a heap data structure in Python?', opts: ['A sorted list', 'A min-heap or max-heap implemented via heapq module', 'A dictionary of priorities', 'A stack variant'], ans: 1, diff: 'medium', exp: 'Python\'s heapq module implements a min-heap on a regular list.' },
      { q: 'What does dict.get(key, default) do?', opts: ['Raises KeyError if key missing', 'Returns default if key missing, without raising an error', 'Sets the key to default if missing', 'Deletes the key'], ans: 1, diff: 'easy', exp: '.get() safely retrieves a value; returns the default if the key does not exist.' },
      { q: 'What is a list comprehension?', opts: ['A way to document lists', 'A concise way to create lists using an expression and optional condition', 'A method to sort lists', 'A way to merge two lists'], ans: 1, diff: 'easy', exp: 'Example: [x*2 for x in range(5) if x > 1]' },
      { q: 'What is the difference between a set and a list?', opts: ['Sets are ordered; lists are not', 'Sets have no duplicates and are unordered; lists allow duplicates and are ordered', 'Lists have no duplicates', 'No practical difference'], ans: 1, diff: 'easy', exp: 'Sets enforce uniqueness and do not preserve insertion order.' },
      { q: 'Which Python structure is best for counting occurrences?', opts: ['list', 'tuple', 'collections.Counter', 'set'], ans: 2, diff: 'medium', exp: 'Counter is a dict subclass designed for counting hashable objects.' },
      { q: 'What does zip() do in Python?', opts: ['Compresses files', 'Combines multiple iterables element-by-element', 'Flattens a nested list', 'Sorts two lists together'], ans: 1, diff: 'easy', exp: 'zip(a, b) returns an iterator of tuples pairing elements from each iterable.' },
      { q: 'What is the complexity of lookup in a Python set?', opts: ['O(n)', 'O(log n)', 'O(1) average', 'O(n²)'], ans: 2, diff: 'medium', exp: 'Set lookup uses hashing, giving O(1) average time complexity.' },
      { q: 'What does collections.defaultdict do?', opts: ['Creates a read-only dict', 'Provides a default value for missing keys automatically', 'Sorts a dictionary', 'Prevents key updates'], ans: 1, diff: 'medium', exp: 'defaultdict creates a default value using a factory function when a missing key is accessed.' },
      { q: 'What is a named tuple?', opts: ['A tuple with a name attribute', 'A tuple subclass with named fields', 'A dictionary with tuple values', 'A tuple that can be modified'], ans: 1, diff: 'medium', exp: 'namedtuple creates tuple subclasses with named fields: Point = namedtuple("Point", ["x","y"])' },
    ],
    'Database-SQL Joins': [
      { q: 'What does an INNER JOIN return?', opts: ['All rows from the left table', 'All rows from both tables', 'Only matching rows from both tables', 'All rows from the right table'], ans: 2, diff: 'easy', exp: 'INNER JOIN returns only rows where the join condition is satisfied in both tables.' },
      { q: 'What does a LEFT JOIN return?', opts: ['All rows from right table, matched from left', 'All rows from left table, with NULLs for unmatched right rows', 'Only matching rows', 'All rows from both tables'], ans: 1, diff: 'easy', exp: 'LEFT JOIN returns all left table rows; unmatched right side columns are NULL.' },
      { q: 'What is a CROSS JOIN?', opts: ['Joins on a cross-column condition', 'Returns Cartesian product of both tables', 'Joins only NULL values', 'Same as INNER JOIN'], ans: 1, diff: 'medium', exp: 'CROSS JOIN produces every combination of rows from both tables (n × m rows).' },
      { q: 'Which join returns rows that exist in the right table but not in the left?', opts: ['LEFT JOIN', 'INNER JOIN', 'RIGHT JOIN with NULL check on left', 'FULL OUTER JOIN'], ans: 2, diff: 'medium', exp: 'RIGHT JOIN with WHERE left_table.id IS NULL returns rows only in the right table.' },
      { q: 'What is a SELF JOIN?', opts: ['A table joined to a copy of itself', 'A join on the same column name', 'A join with no condition', 'A join inside a subquery'], ans: 0, diff: 'medium', exp: 'SELF JOIN joins a table to itself, often using aliases: SELECT a.*, b.* FROM employees a JOIN employees b ON a.manager_id = b.id' },
      { q: 'What is the difference between WHERE and HAVING in SQL?', opts: ['No difference', 'WHERE filters rows before grouping; HAVING filters after grouping', 'HAVING filters rows before grouping; WHERE filters after', 'HAVING works with JOINs only'], ans: 1, diff: 'medium', exp: 'WHERE filters individual rows; HAVING filters groups after GROUP BY.' },
      { q: 'What does FULL OUTER JOIN return?', opts: ['Only matching rows', 'All rows from left with NULLs for unmatched right', 'All rows from both tables with NULLs for non-matching', 'Same as CROSS JOIN'], ans: 2, diff: 'medium', exp: 'FULL OUTER JOIN returns all rows from both tables, with NULLs where there is no match.' },
      { q: 'What is a NATURAL JOIN?', opts: ['A join without ON clause that matches on all common column names', 'A join based on foreign keys only', 'A join that excludes NULL values', 'An INNER JOIN with ORDER BY'], ans: 0, diff: 'hard', exp: 'NATURAL JOIN automatically joins on all columns with the same name in both tables.' },
      { q: 'Which SQL clause is used to filter rows returned by a JOIN?', opts: ['HAVING', 'GROUP BY', 'WHERE', 'ORDER BY'], ans: 2, diff: 'easy', exp: 'WHERE filters rows after the JOIN condition is applied.' },
      { q: 'What is the ON clause in a JOIN?', opts: ['Specifies output columns', 'Specifies the join condition', 'Orders results', 'Filters grouped results'], ans: 1, diff: 'easy', exp: 'ON specifies the condition for matching rows between tables.' },
      { q: 'What happens when you JOIN on a non-unique column?', opts: ['Error', 'Only the first match is returned', 'Multiple rows may be produced per match (multiplication effect)', 'NULL is returned for duplicates'], ans: 2, diff: 'hard', exp: 'Joining on non-unique values creates a Cartesian-like multiplication of matching rows.' },
      { q: 'Which JOIN type does SQL default to when only JOIN is specified?', opts: ['CROSS JOIN', 'LEFT JOIN', 'INNER JOIN', 'OUTER JOIN'], ans: 2, diff: 'easy', exp: 'JOIN without qualifier defaults to INNER JOIN.' },
      { q: 'What is the purpose of table aliases in JOINs?', opts: ['Required for JOINs to work', 'Improve query performance', 'Shorten table name references and allow self-joins', 'Enable index usage'], ans: 2, diff: 'easy', exp: 'Aliases (AS) provide shorter names or allow a table to join itself with different references.' },
      { q: 'What is a theta join?', opts: ['A join using any comparison operator in the condition', 'A trigonometric join', 'A join on theta columns only', 'Same as equi-join'], ans: 0, diff: 'hard', exp: 'A theta join uses comparison operators like >, <, !=, not just equality.' },
      { q: 'Can you JOIN more than two tables in a single query?', opts: ['No, maximum two', 'Yes, by chaining multiple JOIN clauses', 'Only with subqueries', 'Only with UNION'], ans: 1, diff: 'easy', exp: 'Multiple tables can be joined: SELECT ... FROM A JOIN B ON ... JOIN C ON ...' },
    ],
    'Database-Indexing': [
      { q: 'What is the primary purpose of a database index?', opts: ['Store backup data', 'Speed up data retrieval queries', 'Compress data', 'Enforce data types'], ans: 1, diff: 'easy', exp: 'Indexes improve query speed by allowing the database to find rows without scanning the full table.' },
      { q: 'What data structure do most relational databases use for indexes?', opts: ['Hash table', 'B-Tree or B+ Tree', 'Binary search tree', 'Linked list'], ans: 1, diff: 'medium', exp: 'B-Tree and B+ Tree are used for their balanced nature and support for range queries.' },
      { q: 'What is the main trade-off of adding too many indexes?', opts: ['Improved read speed only', 'Slower writes and more storage usage', 'Better compression', 'Faster DELETE operations'], ans: 1, diff: 'medium', exp: 'Indexes speed reads but slow down INSERT/UPDATE/DELETE and consume extra disk space.' },
      { q: 'What is a composite index?', opts: ['An index on multiple tables', 'An index built on multiple columns', 'An index for composite data types', 'A partitioned index'], ans: 1, diff: 'medium', exp: 'A composite (multi-column) index covers multiple columns and is useful for multi-column queries.' },
      { q: 'What is a clustered index?', opts: ['An index that groups similar values', 'An index where the data rows are physically sorted by the index key', 'An index on foreign keys', 'An index that compresses data'], ans: 1, diff: 'medium', exp: 'A clustered index determines the physical order of rows in a table; only one per table.' },
      { q: 'What is a covering index?', opts: ['An index that covers multiple tables', 'An index that includes all columns needed by a query, avoiding table lookups', 'An index that covers NULL values', 'An index that spans all rows'], ans: 1, diff: 'hard', exp: 'A covering index satisfies a query entirely from the index, without accessing the table data.' },
      { q: 'What is index selectivity?', opts: ['The number of indexes on a table', 'How unique index values are relative to total rows (higher = better)', 'The size of an index', 'The order of columns in an index'], ans: 1, diff: 'hard', exp: 'High selectivity (many unique values) makes an index more effective for filtering.' },
      { q: 'When does a full table scan occur despite an index existing?', opts: ['Never', 'When the query fetches more than ~20-30% of rows or ignores index columns', 'Only for SELECT *', 'When ORDER BY is used'], ans: 1, diff: 'hard', exp: 'The query optimizer may choose a full scan when fetching a large percentage of rows or when index conditions are not met.' },
      { q: 'What is a partial index?', opts: ['An index covering half the table', 'An index built on a subset of rows based on a condition', 'An incomplete index', 'A hash index'], ans: 1, diff: 'hard', exp: 'A partial index (e.g., WHERE status = \'active\') indexes only rows matching a condition, saving space.' },
      { q: 'Which SQL statement shows whether a query uses an index?', opts: ['DESCRIBE', 'ANALYZE', 'EXPLAIN', 'PROFILE'], ans: 2, diff: 'medium', exp: 'EXPLAIN (or EXPLAIN ANALYZE) shows the query execution plan, including index usage.' },
      { q: 'Can a table have no primary key?', opts: ['No, it is always required', 'Yes, but it is strongly discouraged', 'Only for temporary tables', 'Only in NoSQL databases'], ans: 1, diff: 'medium', exp: 'A table can technically exist without a primary key, but it is bad practice as it can lead to duplicate rows.' },
      { q: 'What is the difference between unique and non-unique indexes?', opts: ['Unique indexes are faster', 'Unique indexes enforce no duplicate values in indexed columns', 'Non-unique indexes cannot be used for sorting', 'No difference in behavior'], ans: 1, diff: 'easy', exp: 'UNIQUE INDEX enforces uniqueness of values; non-unique allows duplicates.' },
      { q: 'What is index fragmentation?', opts: ['Missing index columns', 'Logical disorder in index pages causing performance degradation', 'Index with too many columns', 'Index on NULL columns'], ans: 1, diff: 'hard', exp: 'Fragmentation happens when index pages become disordered due to INSERT/UPDATE/DELETE operations.' },
      { q: 'Which index type supports full-text search?', opts: ['B-Tree', 'Hash', 'Full-Text Index', 'Bitmap'], ans: 2, diff: 'medium', exp: 'Full-text indexes enable efficient text search across large text columns.' },
      { q: 'What is a hash index best suited for?', opts: ['Range queries', 'Exact equality lookups', 'Sorting', 'Joining large tables'], ans: 1, diff: 'medium', exp: 'Hash indexes are optimal for exact equality (=) comparisons but cannot support range queries.' },
    ],
    'Database-Normalization': [
      { q: 'What is the goal of database normalization?', opts: ['Increase query speed', 'Reduce data redundancy and improve data integrity', 'Add more tables', 'Compress data'], ans: 1, diff: 'easy', exp: 'Normalization organizes data to eliminate redundancy and ensure data integrity.' },
      { q: 'A table is in 1NF if:', opts: ['It has a primary key', 'All column values are atomic (indivisible) and each column has a unique name', 'It has no foreign keys', 'All rows are unique'], ans: 1, diff: 'medium', exp: '1NF requires atomic values, unique column names, and no repeating groups.' },
      { q: 'What violates 2NF?', opts: ['Having a composite primary key', 'Having partial dependency (non-key column depends on part of a composite key)', 'Having NULL values', 'Having no indexes'], ans: 1, diff: 'medium', exp: '2NF is violated when a non-key attribute depends on only part of a composite primary key.' },
      { q: 'What is a transitive dependency?', opts: ['A dependency on a foreign key', 'A non-key column depends on another non-key column', 'A dependency across tables', 'A recursive dependency'], ans: 1, diff: 'medium', exp: 'Transitive dependency: A → B and B → C, so A → C indirectly.' },
      { q: 'What does 3NF eliminate?', opts: ['Partial dependencies', 'Transitive dependencies', 'All redundancy', 'Multi-valued dependencies'], ans: 1, diff: 'medium', exp: '3NF removes transitive dependencies so every non-key attribute depends only on the primary key.' },
      { q: 'What is BCNF (Boyce-Codd Normal Form)?', opts: ['A stricter version of 3NF where every determinant is a candidate key', 'Same as 3NF', 'A normalization for multi-valued dependencies', 'A form that eliminates NULL values'], ans: 0, diff: 'hard', exp: 'BCNF is stricter than 3NF: for every functional dependency X → Y, X must be a super key.' },
      { q: 'What is denormalization?', opts: ['Converting 3NF to 1NF', 'Intentionally introducing redundancy to improve read performance', 'Removing all indexes', 'Adding foreign key constraints'], ans: 1, diff: 'medium', exp: 'Denormalization trades data redundancy for faster queries by reducing costly joins.' },
      { q: 'What is a functional dependency?', opts: ['A stored function dependency', 'X → Y: knowing X uniquely determines Y', 'A foreign key reference', 'A trigger dependency'], ans: 1, diff: 'medium', exp: 'Functional dependency: the value of X uniquely determines the value of Y.' },
      { q: 'What is 4NF concerned with?', opts: ['Transitive dependencies', 'Multi-valued dependencies', 'Join dependencies', 'Partial dependencies'], ans: 1, diff: 'hard', exp: '4NF eliminates non-trivial multi-valued dependencies that are not functional dependencies.' },
      { q: 'Which normal form removes partial dependencies?', opts: ['1NF', '2NF', '3NF', 'BCNF'], ans: 1, diff: 'medium', exp: '2NF requires that every non-prime attribute is fully functionally dependent on the whole primary key.' },
      { q: 'What is a candidate key?', opts: ['Any column that could be a foreign key', 'A minimal set of attributes that uniquely identifies a row', 'The first column of a table', 'A key with no NULL values'], ans: 1, diff: 'medium', exp: 'A candidate key is any minimal superkey—a set of attributes that uniquely identifies rows.' },
      { q: 'What is a prime attribute?', opts: ['The primary key column', 'An attribute that is part of any candidate key', 'A column with no NULLs', 'The first column defined in a table'], ans: 1, diff: 'hard', exp: 'Prime attributes are those that belong to at least one candidate key.' },
      { q: 'A relation is in 1NF but NOT 2NF when:', opts: ['It has no primary key', 'It has partial dependencies on a composite key', 'It has transitive dependencies', 'It has multi-valued dependencies'], ans: 1, diff: 'medium', exp: '2NF violation occurs when non-key attributes depend on only part of a composite primary key.' },
      { q: 'What is the first step in normalization?', opts: ['Remove transitive dependencies', 'Ensure the relation is in 1NF', 'Add a primary key', 'Create indexes'], ans: 1, diff: 'easy', exp: '1NF is the base requirement: atomic values, unique columns, no repeating groups.' },
      { q: 'What is a surrogate key?', opts: ['A natural key from the business domain', 'An artificial key (e.g., auto-increment ID) with no business meaning', 'A key that spans multiple columns', 'A key stored externally'], ans: 1, diff: 'medium', exp: 'Surrogate keys are system-generated (e.g., UUID, auto-increment) with no inherent business meaning.' },
    ],
    'Aptitude-Quantitative': [
      { q: 'What is 15% of 240?', opts: ['34', '36', '38', '32'], ans: 1, diff: 'easy', exp: '15% of 240 = (15/100) × 240 = 36.' },
      { q: 'A train 150m long passes a pole in 15 seconds. Find its speed in km/h.', opts: ['36', '40', '45', '54'], ans: 0, diff: 'medium', exp: 'Speed = 150/15 = 10 m/s = 10 × 18/5 = 36 km/h.' },
      { q: 'If A can do a job in 10 days and B in 15 days, how many days to complete together?', opts: ['5', '6', '7', '8'], ans: 1, diff: 'medium', exp: 'Combined rate = 1/10 + 1/15 = 1/6. Time = 6 days.' },
      { q: 'What is the simple interest on ₹5000 at 8% per annum for 3 years?', opts: ['₹1000', '₹1200', '₹1500', '₹900'], ans: 1, diff: 'easy', exp: 'SI = PRT/100 = 5000 × 8 × 3/100 = ₹1200.' },
      { q: 'The ratio of boys to girls is 3:2. If there are 60 students, how many girls?', opts: ['24', '36', '30', '20'], ans: 0, diff: 'easy', exp: 'Girls = (2/5) × 60 = 24.' },
      { q: 'What is the LCM of 12 and 18?', opts: ['6', '36', '72', '216'], ans: 1, diff: 'easy', exp: 'LCM(12, 18) = 36.' },
      { q: 'A shopkeeper gives 20% discount on ₹500. What is the selling price?', opts: ['₹400', '₹450', '₹380', '₹480'], ans: 0, diff: 'easy', exp: 'Discount = 20% of 500 = ₹100. SP = 500 - 100 = ₹400.' },
      { q: 'If 3x + 7 = 22, what is x?', opts: ['3', '4', '5', '6'], ans: 2, diff: 'easy', exp: '3x = 22 - 7 = 15, so x = 5.' },
      { q: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)', opts: ['154 cm²', '144 cm²', '176 cm²', '168 cm²'], ans: 0, diff: 'easy', exp: 'Area = π × 7² = (22/7) × 49 = 154 cm².' },
      { q: 'Two numbers are in ratio 5:3. Their sum is 64. What are the numbers?', opts: ['40 and 24', '35 and 29', '38 and 26', '45 and 19'], ans: 0, diff: 'medium', exp: 'Numbers are 5k and 3k. 8k = 64, k = 8. Numbers = 40 and 24.' },
      { q: 'What is the compound interest on ₹10000 at 10% for 2 years?', opts: ['₹2000', '₹2100', '₹2200', '₹1900'], ans: 1, diff: 'medium', exp: 'CI = P(1+r/100)^n - P = 10000(1.1)² - 10000 = 12100 - 10000 = ₹2100.' },
      { q: 'A car covers 300 km in 5 hours. What is the speed?', opts: ['50 km/h', '60 km/h', '55 km/h', '65 km/h'], ans: 1, diff: 'easy', exp: 'Speed = Distance/Time = 300/5 = 60 km/h.' },
      { q: 'What is the HCF of 48 and 36?', opts: ['6', '9', '12', '18'], ans: 2, diff: 'easy', exp: 'HCF(48, 36) = 12.' },
      { q: 'Find the average of 15, 25, 35, 45, 55.', opts: ['30', '35', '40', '45'], ans: 1, diff: 'easy', exp: 'Average = (15+25+35+45+55)/5 = 175/5 = 35.' },
      { q: 'If price increases by 25% and then decreases by 25%, what is the net change?', opts: ['No change', '-6.25%', '+6.25%', '-25%'], ans: 1, diff: 'hard', exp: 'Net = 1.25 × 0.75 = 0.9375, meaning a 6.25% decrease.' },
    ],
    'Aptitude-Logical Reasoning': [
      { q: 'All cats are animals. All animals have legs. What can be concluded?', opts: ['All animals are cats', 'Some cats may not have legs', 'All cats have legs', 'No cats have legs'], ans: 2, diff: 'easy', exp: 'Syllogism: All cats are animals → All animals have legs → All cats have legs.' },
      { q: 'If MANGO is coded as OCPIQ, what is APPLE coded as?', opts: ['CRRNG', 'CRRNF', 'BQQMF', 'CQQNG'], ans: 0, diff: 'medium', exp: 'Each letter is shifted by +2: M→O, A→C, N→P, G→I, O→Q. APPLE → CRRNF (A→C, P→R, P→R, L→N, E→G).' },
      { q: 'Which number comes next: 2, 6, 12, 20, 30, ?', opts: ['40', '42', '44', '36'], ans: 1, diff: 'medium', exp: 'Pattern: n(n+1) → 1×2, 2×3, 3×4, 4×5, 5×6, 6×7 = 42.' },
      { q: 'Pointing to a man, a woman says "His mother is my mother\'s daughter." How is the man related to the woman?', opts: ['Brother', 'Son', 'Uncle', 'Nephew'], ans: 1, diff: 'medium', exp: 'My mother\'s daughter = the woman herself. So his mother is the woman. The man is her son.' },
      { q: 'A is older than B. B is older than C. Who is youngest?', opts: ['A', 'B', 'C', 'Cannot determine'], ans: 2, diff: 'easy', exp: 'A > B > C. C is the youngest.' },
      { q: 'Which figure does NOT belong: Circle, Triangle, Square, Cone?', opts: ['Circle', 'Triangle', 'Square', 'Cone'], ans: 3, diff: 'easy', exp: 'Cone is a 3D shape; Circle, Triangle, Square are 2D shapes.' },
      { q: 'Statement: All flowers are plants. Some plants are trees. Conclusion: Some flowers are trees.', opts: ['True', 'False', 'Partially true', 'Cannot determine'], ans: 3, diff: 'medium', exp: '"Some plants are trees" does not guarantee that any of those plants are flowers.' },
      { q: 'If '+' means '×', '×' means '-', '-' means '÷', '÷' means '+', find: 4 + 3 × 5 ÷ 2 - 1', opts: ['9', '13', '11', '7'], ans: 2, diff: 'hard', exp: 'After substitution: 4×3 - 5+2÷1 = 12-5+2 = 11.' },
      { q: 'Arrange: Sun, Season, Rotation, Day. What is the correct order from smallest to largest time cycle?', opts: ['Day, Rotation, Season, Sun', 'Rotation, Day, Season, Sun', 'Day, Season, Rotation, Sun', 'Rotation, Season, Day, Sun'], ans: 1, diff: 'medium', exp: 'Rotation (~24h) = Day < Season (~3 months) < Year (around Sun). Day and Rotation are the same unit.' },
      { q: 'In a row, Rahul is 10th from left and 20th from right. How many people are in the row?', opts: ['28', '29', '30', '31'], ans: 1, diff: 'medium', exp: 'Total = 10 + 20 - 1 = 29.' },
      { q: 'Complete the analogy: Book : Library :: Painting : ?', opts: ['Artist', 'Museum', 'Canvas', 'Gallery'], ans: 3, diff: 'easy', exp: 'Books are stored/displayed in a Library; Paintings are displayed in a Gallery.' },
      { q: 'Which day comes 2 days after the day that comes 3 days before Wednesday?', opts: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'], ans: 0, diff: 'medium', exp: '3 days before Wednesday = Sunday. 2 days after Sunday = Tuesday. Wait: Sun + 2 = Tuesday. Re-check: 3 before Wed = Sun, 2 after Sun = Tuesday.' },
      { q: 'A cube painted red on all faces is cut into 27 equal small cubes. How many cubes have exactly 2 red faces?', opts: ['6', '8', '12', '24'], ans: 2, diff: 'hard', exp: 'Edge pieces (excluding corners) have exactly 2 painted faces. There are 12 edges × 1 middle = 12 cubes.' },
      { q: 'Find the odd one out: 8, 27, 64, 100, 125', opts: ['8', '27', '100', '125'], ans: 2, diff: 'medium', exp: '8=2³, 27=3³, 64=4³, 125=5³ are perfect cubes. 100=10² is not a perfect cube.' },
      { q: 'If FRIEND is coded as HUMJTK, how is CANDLE coded?', opts: ['ECOFLG', 'ECPFNG', 'DCPFMG', 'EBNCKF'], ans: 1, diff: 'hard', exp: 'Each letter is shifted by +2: C→E, A→C, N→P, D→F, L→N, E→G = ECPFNG.' },
    ],
  };

  const insertSeedData = db.transaction(() => {
    for (const topicDef of topics) {
      const topicResult = insertTopic.run(topicDef.name, topicDef.icon);
      const topicId = topicResult.lastInsertRowid;

      const subtopicNames = allSubtopics[topicDef.name] || [];
      for (const subtopicName of subtopicNames) {
        const subtopicResult = insertSubtopic.run(topicId, subtopicName);
        const subtopicId = subtopicResult.lastInsertRowid;

        const key = `${topicDef.name}-${subtopicName}`;
        const qs = questions[key] || [];
        for (const q of qs) {
          insertQuestion.run(
            subtopicId,
            q.q,
            JSON.stringify(q.opts),
            q.ans,
            q.diff,
            q.exp
          );
        }
      }
    }
  });

  insertSeedData();
  console.log('✅ Database seeded with topics and questions.');
}

module.exports = { db, initDB };
