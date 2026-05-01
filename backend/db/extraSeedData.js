module.exports = {
  Java: {
    'Spring Boot': [
      { q: 'What is the primary feature of Spring Boot?', opts: ['Auto-configuration', 'Database management', 'Frontend rendering', 'Manual bean configuration'], ans: 0, d: 'easy', exp: 'Spring Boot auto-configures Spring applications.' },
      { q: 'Which annotation is used to mark a class as a Spring Boot application?', opts: ['@SpringBoot', '@SpringBootApplication', '@EnableAutoConfiguration', '@ComponentScan'], ans: 1, d: 'easy', exp: '@SpringBootApplication is a convenience annotation.' },
      { q: 'Which embedded server is default in Spring Boot?', opts: ['Jetty', 'Undertow', 'Tomcat', 'GlassFish'], ans: 2, d: 'easy', exp: 'Tomcat is the default embedded server.' },
      { q: 'How do you inject a dependency in Spring?', opts: ['@Inject', '@Autowired', '@Dependency', '@Provide'], ans: 1, d: 'easy', exp: '@Autowired automatically injects beans.' },
      { q: 'Which application property changes the server port?', opts: ['server.port', 'port.server', 'app.port', 'spring.port'], ans: 0, d: 'easy', exp: 'server.port=8080 is used to change the port.' },
      { q: 'What does @RestController do?', opts: ['Creates a web view', 'Combines @Controller and @ResponseBody', 'Handles database connections', 'Secures the endpoint'], ans: 1, d: 'medium', exp: '@RestController simplifies creating RESTful services.' },
      { q: 'Which dependency provides production-ready features like health checks?', opts: ['Spring Web', 'Spring Security', 'Spring Boot Actuator', 'Spring Data JPA'], ans: 2, d: 'medium', exp: 'Actuator provides monitoring and metrics.' },
      { q: 'What is the purpose of application.properties?', opts: ['Store HTML', 'Configure application settings', 'Write Java code', 'Define database schemas'], ans: 1, d: 'easy', exp: 'Used to define configuration properties.' },
      { q: 'Which annotation maps HTTP GET requests?', opts: ['@RequestMapping', '@PostMapping', '@GetMapping', '@HttpGetMapping'], ans: 2, d: 'easy', exp: '@GetMapping specifically handles GET requests.' },
      { q: 'What is a Spring Bean?', opts: ['A coffee bean', 'An object managed by the Spring IoC container', 'A database row', 'A utility class'], ans: 1, d: 'medium', exp: 'Beans form the backbone of a Spring application.' }
    ],
    'Advanced OOP': [
      { q: 'What is composition in Java?', opts: ['Inheriting from a class', 'A "has-a" relationship between objects', 'A "is-a" relationship', 'Method overloading'], ans: 1, d: 'medium', exp: 'Composition is building complex objects from simpler ones (has-a).' },
      { q: 'Which keyword prevents a variable from being serialized?', opts: ['transient', 'volatile', 'static', 'final'], ans: 0, d: 'medium', exp: 'Transient variables are ignored during serialization.' },
      { q: 'What is a functional interface?', opts: ['An interface with no methods', 'An interface with exactly one abstract method', 'An interface with only default methods', 'An interface used for UI'], ans: 1, d: 'medium', exp: 'Used for lambda expressions.' },
      { q: 'What does the volatile keyword do?', opts: ['Makes variable constant', 'Ensures visibility of changes to variables across threads', 'Prevents serialization', 'Synchronizes a method'], ans: 1, d: 'hard', exp: 'Volatile prevents thread caching of variables.' },
      { q: 'Which class cannot be subclassed?', opts: ['Abstract class', 'Public class', 'Final class', 'Static class'], ans: 2, d: 'easy', exp: 'The final keyword prevents inheritance.' }
    ]
  },
  Python: {
    'Django': [
      { q: 'What architectural pattern does Django follow?', opts: ['MVC', 'MVT (Model-View-Template)', 'MVP', 'MVVM'], ans: 1, d: 'easy', exp: 'Django uses Model-View-Template.' },
      { q: 'Which command creates a new Django project?', opts: ['django start', 'django-admin startproject', 'python manage.py new', 'django-admin create'], ans: 1, d: 'medium', exp: 'django-admin startproject creates the boilerplate.' },
      { q: 'What is the purpose of models.py?', opts: ['Define HTML templates', 'Define database schema', 'Handle URL routing', 'Write business logic'], ans: 1, d: 'easy', exp: 'Models map to database tables.' },
      { q: 'How do you apply database migrations in Django?', opts: ['python manage.py migrate', 'python manage.py apply', 'django-admin migrate', 'python manage.py makemigrations'], ans: 0, d: 'easy', exp: 'migrate applies the migrations to the DB.' },
      { q: 'What is a QuerySet in Django?', opts: ['A SQL injection', 'A collection of database queries to execute', 'A list of objects from the database', 'A form validation tool'], ans: 2, d: 'medium', exp: 'QuerySets represent collections of database objects.' }
    ],
    'Advanced Python': [
      { q: 'What is a Python generator?', opts: ['A function returning a list', 'A function that yields values one at a time', 'A class creator', 'A database connection'], ans: 1, d: 'medium', exp: 'Generators use yield to produce values lazily.' },
      { q: 'What is a context manager used for?', opts: ['Managing global variables', 'Managing resources like file streams (using "with")', 'Managing database state', 'Managing user sessions'], ans: 1, d: 'medium', exp: 'Context managers ensure proper setup and teardown.' },
      { q: 'What is the GIL in Python?', opts: ['Global Interpreter Lock', 'General Interface Library', 'Graphical Integrated Layout', 'Global Iteration Loop'], ans: 0, d: 'hard', exp: 'The GIL prevents multiple native threads from executing Python bytecodes at once.' },
      { q: 'What does the zip() function do?', opts: ['Compresses files', 'Combines multiple iterables element-wise', 'Sorts a list', 'Unpacks a dictionary'], ans: 1, d: 'medium', exp: 'zip() pairs elements from different iterables.' },
      { q: 'What is monkey patching?', opts: ['Fixing bugs quickly', 'Dynamic modifications of a class or module at runtime', 'A security vulnerability', 'A testing framework'], ans: 1, d: 'hard', exp: 'Modifying behavior dynamically at runtime.' }
    ]
  },
  Database: {
    'NoSQL': [
      { q: 'Which is a characteristic of NoSQL databases?', opts: ['Strict schemas', 'Schema-less or flexible schema', 'Always ACID compliant', 'Relational tables'], ans: 1, d: 'easy', exp: 'NoSQL allows flexible data models.' },
      { q: 'MongoDB is an example of what type of NoSQL database?', opts: ['Key-Value', 'Graph', 'Document', 'Column-Family'], ans: 2, d: 'easy', exp: 'MongoDB stores data in JSON-like documents.' },
      { q: 'Which NoSQL database is best for highly connected data?', opts: ['Redis', 'Cassandra', 'Neo4j', 'MongoDB'], ans: 2, d: 'medium', exp: 'Neo4j is a Graph database.' },
      { q: 'What does the CAP theorem state?', opts: ['Consistency, Availability, Partition tolerance - pick 2', 'Create, Alter, Partition', 'Consistency, Accuracy, Performance', 'Centralized, Available, Performant'], ans: 0, d: 'hard', exp: 'You can only guarantee two out of the three.' },
      { q: 'Redis is primarily used as a?', opts: ['Graph database', 'In-memory key-value store', 'Document database', 'Relational database'], ans: 1, d: 'easy', exp: 'Redis is a fast in-memory key-value database.' }
    ]
  },
  Aptitude: {
    'Data Interpretation': [
      { q: 'If a pie chart shows 36 degrees for category A, what percentage is it?', opts: ['10%', '20%', '36%', '15%'], ans: 0, d: 'medium', exp: '36/360 * 100 = 10%.' },
      { q: 'A bar chart shows sales of 100, 150, and 200 over 3 years. Average sales?', opts: ['125', '150', '175', '450'], ans: 1, d: 'easy', exp: '(100+150+200)/3 = 150.' },
      { q: 'If revenue grew from 200 to 250, what is the percentage growth?', opts: ['20%', '25%', '50%', '30%'], ans: 1, d: 'medium', exp: '(50/200)*100 = 25%.' },
      { q: 'A line graph drops from 500 to 400. What is the percentage decrease?', opts: ['10%', '20%', '25%', '100%'], ans: 1, d: 'medium', exp: '(100/500)*100 = 20%.' },
      { q: 'If 40% of 500 students passed, how many failed?', opts: ['200', '300', '400', '100'], ans: 1, d: 'easy', exp: '60% failed. 0.6 * 500 = 300.' }
    ]
  },
  DSA: {
    'Dynamic Programming': [
      { q: 'What is the main characteristic of Dynamic Programming?', opts: ['Divide and conquer', 'Overlapping subproblems and optimal substructure', 'Randomized choices', 'Greedy choices'], ans: 1, d: 'medium', exp: 'DP solves overlapping subproblems by storing results.' },
      { q: 'Which technique is used to store DP results?', opts: ['Hashing', 'Memoization', 'Sorting', 'Tree traversal'], ans: 1, d: 'easy', exp: 'Memoization caches results of expensive function calls.' },
      { q: 'What is the time complexity of naive recursive Fibonacci vs DP Fibonacci?', opts: ['O(n) vs O(1)', 'O(2^n) vs O(n)', 'O(n^2) vs O(log n)', 'O(n) vs O(log n)'], ans: 1, d: 'medium', exp: 'DP reduces exponential time to linear time.' },
      { q: 'Which problem is a classic DP problem?', opts: ['Binary Search', 'Knapsack Problem', 'Quick Sort', 'Breadth First Search'], ans: 1, d: 'easy', exp: '0/1 Knapsack is famously solved using DP.' },
      { q: 'What is the difference between Top-Down and Bottom-Up DP?', opts: ['Top-down uses recursion+memoization; Bottom-up uses iteration+tabulation', 'Top-down is faster', 'Bottom-up uses recursion', 'No difference'], ans: 0, d: 'medium', exp: 'Top-down is recursive memoization, bottom-up builds a table iteratively.' }
    ]
  }
};
