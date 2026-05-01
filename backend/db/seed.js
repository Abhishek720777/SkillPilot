require('dotenv').config();
const mongoose = require('mongoose');
const Topic = require('../models/Topic');
const Subtopic = require('../models/Subtopic');
const Question = require('../models/Question');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizbattle';

const DATA = {
  Java: {
    OOP: [
      { q:'Which keyword achieves inheritance in Java?', opts:['implements','extends','inherits','super'], ans:1, d:'easy', exp:'"extends" inherits from a parent class.' },
      { q:'What does encapsulation mean in OOP?', opts:['Hiding implementation behind a public interface','Creating multiple objects','Inheriting from a base class','Overloading methods'], ans:0, d:'easy', exp:'Encapsulation bundles data and restricts direct access.' },
      { q:'Which is NOT a pillar of OOP?', opts:['Encapsulation','Compilation','Polymorphism','Abstraction'], ans:1, d:'easy', exp:'The four pillars are Encapsulation, Abstraction, Inheritance, Polymorphism.' },
      { q:'What does the "final" keyword do on a class?', opts:['Makes it abstract','Prevents instantiation','Prevents inheritance','Makes all methods static'], ans:2, d:'medium', exp:'A final class cannot be subclassed.' },
      { q:'Which concept lets a subclass provide its own method implementation?', opts:['Overloading','Overriding','Abstraction','Encapsulation'], ans:1, d:'medium', exp:'Method overriding provides a specific implementation of an inherited method.' },
      { q:'Calling a method with the same name but different parameters is called?', opts:['Compile error','Runtime error','Method overloading','Method overriding'], ans:2, d:'easy', exp:'Overloading allows same name with different parameters.' },
      { q:'Which access modifier restricts access to the same class only?', opts:['public','protected','private','default'], ans:2, d:'easy', exp:'private members are only accessible within the declaring class.' },
      { q:'What is an abstract class?', opts:['Only static methods','No constructors','Has abstract methods; cannot be instantiated directly','No methods'], ans:2, d:'medium', exp:'Abstract classes can have both abstract and concrete methods.' },
      { q:'Can a Java class implement multiple interfaces?', opts:['No, only one','Yes','Only if they share methods','Only abstract classes can'], ans:1, d:'easy', exp:'Java supports multiple interface implementation.' },
      { q:'What is "super" used for?', opts:['Call subclass method','Reference current class','Call parent constructor or methods','Create new object'], ans:2, d:'medium', exp:'"super" refers to the parent class.' },
      { q:'Which polymorphism is resolved at runtime?', opts:['Static','Compile-time','Dynamic/Runtime','Method overloading'], ans:2, d:'medium', exp:'Dynamic polymorphism resolves at runtime via virtual dispatch.' },
      { q:'What is a constructor?', opts:['Returns an object','Called when object is created','Static initializer block','Used for garbage collection'], ans:1, d:'easy', exp:'A constructor is automatically called when an object is instantiated.' },
      { q:'Can an abstract class have a constructor?', opts:['No','Yes','Only with no abstract methods','Only if also final'], ans:1, d:'hard', exp:'Abstract classes can have constructors called via super().' },
      { q:'Key difference between interface and abstract class?', opts:['Interfaces can have constructors','Abstract classes can have state; interfaces traditionally cannot','Interfaces support single inheritance only','No difference'], ans:1, d:'hard', exp:'Abstract classes can have instance variables; interfaces are fully abstract.' },
      { q:'A method behaving differently based on the object demonstrates?', opts:['Inheritance','Encapsulation','Polymorphism','Abstraction'], ans:2, d:'medium', exp:'Polymorphism lets one interface represent different types.' },
    ],
    Collections: [
      { q:'Which collection does not allow duplicates?', opts:['ArrayList','LinkedList','HashSet','Vector'], ans:2, d:'easy', exp:'HashSet implements Set which does not allow duplicates.' },
      { q:'What interface does ArrayList implement?', opts:['Set','Map','List','Queue'], ans:2, d:'easy', exp:'ArrayList implements the List interface.' },
      { q:'Time complexity of get() in HashMap?', opts:['O(n)','O(log n)','O(1)','O(n log n)'], ans:2, d:'medium', exp:'HashMap provides O(1) average time using hashing.' },
      { q:'Which collection maintains insertion order?', opts:['HashSet','TreeSet','LinkedHashSet','HashMap'], ans:2, d:'medium', exp:'LinkedHashSet maintains insertion order.' },
      { q:'What does TreeMap sort by?', opts:['Insertion order','Value','Key natural order','Random'], ans:2, d:'medium', exp:'TreeMap sorts entries by key in ascending natural order.' },
      { q:'Which is thread-safe?', opts:['ArrayList','HashMap','HashSet','Vector'], ans:3, d:'medium', exp:'Vector is synchronized and thread-safe.' },
      { q:'What does the Iterator pattern allow?', opts:['Sort a collection','Traverse elements without exposing structure','Search in O(1)','Prevent modification'], ans:1, d:'medium', exp:'Iterator provides uniform traversal.' },
      { q:'Which collection for FIFO queue?', opts:['Stack','ArrayDeque','TreeSet','LinkedHashMap'], ans:1, d:'medium', exp:'ArrayDeque is an efficient FIFO queue.' },
      { q:'Initial capacity of ArrayList in Java?', opts:['5','10','16','8'], ans:1, d:'hard', exp:'Default initial capacity of ArrayList is 10.' },
      { q:'Exception when modifying collection during iteration?', opts:['IndexOutOfBoundsException','ConcurrentModificationException','IllegalStateException','NullPointerException'], ans:1, d:'medium', exp:'ConcurrentModificationException is thrown.' },
      { q:'What does Collections.unmodifiableList() return?', opts:['Sorted list','Thread-safe list','Read-only view','Reversed list'], ans:2, d:'medium', exp:'Returns an unmodifiable view; modifications throw UnsupportedOperationException.' },
      { q:'Difference between HashMap and Hashtable?', opts:['HashMap allows null keys; Hashtable does not','Hashtable is faster','HashMap is synchronized','No difference'], ans:0, d:'hard', exp:'HashMap allows null keys/values and is not synchronized.' },
      { q:'Which method removes all elements from a List?', opts:['delete()','removeAll()','clear()','flush()'], ans:2, d:'easy', exp:'clear() removes all elements.' },
      { q:'PriorityQueue orders elements by?', opts:['Insertion order','Natural ordering or Comparator','Reverse alphabetical','Random'], ans:1, d:'medium', exp:'PriorityQueue orders by natural ordering or Comparator.' },
      { q:'LinkedList in Java is implemented as?', opts:['Doubly linked list','Singly linked list','Circular linked list','Binary tree'], ans:0, d:'easy', exp:'Java LinkedList is doubly linked.' },
    ],
    Exceptions: [
      { q:'Root class of all exceptions in Java?', opts:['Error','Exception','Throwable','RuntimeException'], ans:2, d:'easy', exp:'Throwable is the superclass of all errors and exceptions.' },
      { q:'Difference between checked and unchecked exceptions?', opts:['Checked extend RuntimeException','Unchecked must be caught','Checked must be declared or caught','No difference'], ans:2, d:'medium', exp:'Checked must be handled; unchecked need not be.' },
      { q:'Block always executed regardless of exception?', opts:['try','catch','finally','throws'], ans:2, d:'easy', exp:'The finally block always executes.' },
      { q:'Which is an unchecked exception?', opts:['IOException','SQLException','NullPointerException','ClassNotFoundException'], ans:2, d:'easy', exp:'NullPointerException extends RuntimeException.' },
      { q:'Keyword to manually throw an exception?', opts:['throws','throw','catch','raise'], ans:1, d:'easy', exp:'"throw" explicitly throws an exception.' },
      { q:'What does "throws" in a method signature mean?', opts:['Method catches exceptions','Method may throw those exceptions','Method ignores exceptions','Handles all exceptions'], ans:1, d:'easy', exp:'"throws" declares exceptions a method may throw.' },
      { q:'Can multiple exceptions be caught in one catch block?', opts:['No','Yes, using | operator (Java 7+)','Only RuntimeExceptions','Only checked'], ans:1, d:'medium', exp:'Multi-catch: catch (IOException | SQLException e).' },
      { q:'Exception thrown by integer division by zero?', opts:['ArithmeticException','NumberFormatException','IllegalArgumentException','MathException'], ans:0, d:'easy', exp:'Integer division by zero throws ArithmeticException.' },
      { q:'How to create a custom exception?', opts:['Implement Runnable','Extend Exception or RuntimeException','Implement Throwable','Annotate @Exception'], ans:1, d:'medium', exp:'Extend Exception (checked) or RuntimeException (unchecked).' },
      { q:'What is try-with-resources?', opts:['Catch multiple exceptions','Auto-closes AutoCloseable resources','Retry mechanism','Suppress exceptions'], ans:1, d:'medium', exp:'Auto-closes resources after the try block (Java 7+).' },
      { q:'Exception thrown on invalid cast?', opts:['NullPointerException','ClassCastException','IllegalArgumentException','TypeMismatchException'], ans:1, d:'medium', exp:'ClassCastException on invalid cast.' },
      { q:'Difference between Error and Exception?', opts:['No difference','Errors are serious JVM issues; Exceptions are application-level','Exceptions are uncatchable','Errors must be caught'], ans:1, d:'medium', exp:'Errors indicate JVM issues; Exceptions are application-level.' },
      { q:'What is a checked exception?', opts:['Subclass of RuntimeException','Must be declared or caught at compile time','Never needs handling','Thrown only by JVM'], ans:1, d:'easy', exp:'Checked exceptions must be handled at compile time.' },
      { q:'Can finally prevent exception propagation?', opts:['No','Yes, via return statement or new exception','Only for checked','Only inside loops'], ans:1, d:'hard', exp:'A return statement in finally suppresses the original exception.' },
      { q:'Exception thrown using wait() without owning the object monitor?', opts:['ThreadException','IllegalMonitorStateException','ConcurrentException','SyncException'], ans:1, d:'hard', exp:'IllegalMonitorStateException is thrown.' },
    ],
  },
  Python: {
    Basics: [
      { q:'Correct way to comment a single line in Python?', opts:['// comment','/* comment */','# comment','-- comment'], ans:2, d:'easy', exp:'Python uses # for single-line comments.' },
      { q:'Which data type is mutable?', opts:['tuple','string','int','list'], ans:3, d:'easy', exp:'Lists are mutable; tuples, strings, and ints are immutable.' },
      { q:'What does len([1,2,3]) return?', opts:['2','3','4','Error'], ans:1, d:'easy', exp:'len() returns the number of items.' },
      { q:'Which operator performs floor division?', opts:['/','%','//','**'], ans:2, d:'easy', exp:'// performs floor division e.g. 7 // 2 = 3.' },
      { q:'How to check if a key exists in a dict?', opts:['"key" in dict','dict.has("key")','dict.contains("key")','dict.exists("key")'], ans:0, d:'easy', exp:'Use the "in" operator.' },
      { q:'What does the "pass" statement do?', opts:['Exits loop','Skips iteration','Does nothing; placeholder','Passes value to function'], ans:2, d:'easy', exp:'"pass" is a no-op placeholder.' },
      { q:'What is a lambda function?', opts:['Named function with multiple statements','Anonymous single-expression function','Recursive function','Built-in function'], ans:1, d:'medium', exp:'Lambda creates small anonymous functions.' },
      { q:'Result of "2 ** 3"?', opts:['6','9','8','5'], ans:2, d:'easy', exp:'** is exponentiation; 2^3 = 8.' },
      { q:'Function to convert string to integer?', opts:['str()','float()','int()','num()'], ans:2, d:'easy', exp:'int("42") converts the string "42" to integer 42.' },
      { q:'Difference between "==" and "is"?', opts:['They are identical','"==" compares values; "is" compares identity','"is" compares values','Used for type checking'], ans:1, d:'medium', exp:'"==" checks value; "is" checks object identity.' },
      { q:'What does list[-1] access?', opts:['First element','Last element','Second to last','IndexError'], ans:1, d:'easy', exp:'Negative indexing: -1 accesses the last element.' },
      { q:'Keyword for a generator function?', opts:['return','yield','generate','async'], ans:1, d:'medium', exp:'"yield" makes a function a generator.' },
      { q:'What is a Python decorator?', opts:['Comment style','Function wrapping another function','Class attribute','Module constant'], ans:1, d:'medium', exp:'Decorators wrap functions to modify behavior.' },
      { q:'What does "enumerate" do?', opts:['Returns only values','Returns index-value pairs','Sorts the list','Counts occurrences'], ans:1, d:'medium', exp:'enumerate() returns (index, value) pairs.' },
      { q:'What is output of type(5.0)?', opts:['<class int>','<class float>','<class double>','<class number>'], ans:1, d:'easy', exp:'5.0 is a float literal.' },
    ],
    OOP: [
      { q:'How is a class defined in Python?', opts:['class MyClass:','def MyClass():','object MyClass:','new class MyClass:'], ans:0, d:'easy', exp:'Python uses "class ClassName:" to define a class.' },
      { q:'Role of __init__ in Python?', opts:['Destroys object','Constructor called on creation','Returns string representation','Makes class iterable'], ans:1, d:'easy', exp:'__init__ is the initializer called when an instance is created.' },
      { q:'What does "self" refer to?', opts:['The class itself','The parent class','The current instance','A global variable'], ans:2, d:'easy', exp:'"self" is a reference to the current object instance.' },
      { q:'How to define a class method?', opts:['Using @staticmethod','Using @classmethod with cls','Using @method decorator','Using "class" before def'], ans:1, d:'medium', exp:'@classmethod takes "cls" as first argument.' },
      { q:'What does __str__ define?', opts:['Compare objects','String representation','Hash of object','Memory address'], ans:1, d:'easy', exp:'__str__ defines str(obj) and print(obj).' },
      { q:'How to make attribute "private" in Python?', opts:['private keyword','__ prefix (name mangling)','@private decorator','Cannot be done'], ans:1, d:'medium', exp:'Double underscore triggers name mangling.' },
      { q:'What is multiple inheritance?', opts:['Class with multiple methods','Inheriting from multiple parents','Multiple instances','Multiple constructors'], ans:1, d:'medium', exp:'Python supports: class C(A, B):' },
      { q:'What is the @property decorator for?', opts:['Define class method','Create getters/setters','Make method static','Override parent'], ans:1, d:'medium', exp:'@property allows a method to be accessed like an attribute.' },
      { q:'What does __repr__ return?', opts:['Formal debug string','Object hash','Type of object','True if object is real'], ans:0, d:'medium', exp:'__repr__ returns an unambiguous string for developers.' },
      { q:'What is duck typing?', opts:['Type checking pattern','Type determined by behavior, not class','Using type hints','Enforcing strict types'], ans:1, d:'medium', exp:'"If it walks like a duck and quacks like a duck..."' },
      { q:'What does super() do?', opts:['Copy current object','Returns parent class for delegation','Makes method static','Calls all parent constructors'], ans:1, d:'medium', exp:'super() provides access to parent class methods.' },
      { q:'What is an ABC?', opts:['Class with no methods','Cannot be instantiated; defines interface','Class with class methods only','Inherits from all classes'], ans:1, d:'medium', exp:'ABC defines abstract methods that subclasses must implement.' },
      { q:'What is a mixin?', opts:['Class adding functionality without being a base','Method mixing two objects','Decorator type','Built-in module'], ans:0, d:'hard', exp:'Mixins add specific functionality without being a primary base.' },
      { q:'Which method is called when an object is deleted?', opts:['__remove__','__delete__','__del__','__destroy__'], ans:2, d:'medium', exp:'__del__ is called when the object is garbage collected.' },
      { q:'What is method resolution order (MRO)?', opts:['Order Python searches for methods in class hierarchy','Order of decorators','Memory layout','Attribute initialization order'], ans:0, d:'hard', exp:'MRO follows C3 linearization for method lookup.' },
    ],
    'Data Structures': [
      { q:'What is a Python dictionary?', opts:['Ordered sequence','Collection of key-value pairs','Immutable sequence','Sorted collection'], ans:1, d:'easy', exp:'A dict is a mutable collection of key-value pairs.' },
      { q:'Time complexity of appending to a list?', opts:['O(n)','O(log n)','O(1) amortized','O(n squared)'], ans:2, d:'medium', exp:'List append is O(1) amortized.' },
      { q:'What does collections.deque offer over a list?', opts:['More memory','O(1) at both ends','Thread safety','Auto-sorting'], ans:1, d:'medium', exp:'deque provides O(1) operations at both ends.' },
      { q:'What is a frozenset?', opts:['Auto-sorts','Immutable version of set','Allows duplicates','Stored in file'], ans:1, d:'medium', exp:'frozenset is immutable and hashable.' },
      { q:'Best way to implement a queue in Python?', opts:['list with append/pop(0)','collections.deque with append/popleft','Both are equivalent','Using tuple'], ans:1, d:'medium', exp:'deque.popleft() is O(1) vs list.pop(0) which is O(n).' },
      { q:'What is heapq in Python?', opts:['Sorted list','Min-heap via heapq module','Priority dict','Stack variant'], ans:1, d:'medium', exp:'Python heapq implements a min-heap on a list.' },
      { q:'What does dict.get(key, default) do?', opts:['Raises KeyError','Returns default if key missing','Sets key to default','Deletes key'], ans:1, d:'easy', exp:'.get() returns default if key does not exist.' },
      { q:'What is a list comprehension?', opts:['Document lists','Concise list creation with expression','Sort method','Merge two lists'], ans:1, d:'easy', exp:'Example: [x*2 for x in range(5) if x > 1].' },
      { q:'Difference between set and list?', opts:['Sets are ordered','Sets no duplicates unordered; lists ordered with duplicates','Lists no duplicates','No difference'], ans:1, d:'easy', exp:'Sets enforce uniqueness and are unordered.' },
      { q:'Best structure for counting occurrences?', opts:['list','tuple','collections.Counter','set'], ans:2, d:'medium', exp:'Counter is a dict subclass for counting.' },
      { q:'What does zip() do?', opts:['Compresses files','Combines iterables element-by-element','Flattens list','Sorts two lists'], ans:1, d:'easy', exp:'zip(a, b) pairs elements from each iterable.' },
      { q:'Complexity of lookup in a Python set?', opts:['O(n)','O(log n)','O(1) average','O(n squared)'], ans:2, d:'medium', exp:'Set lookup uses hashing, O(1) average.' },
      { q:'What does collections.defaultdict do?', opts:['Read-only dict','Default value for missing keys','Sorts dictionary','Prevents updates'], ans:1, d:'medium', exp:'defaultdict creates a default value automatically for missing keys.' },
      { q:'What is a named tuple?', opts:['Tuple with name attribute','Tuple subclass with named fields','Dict with tuple values','Modifiable tuple'], ans:1, d:'medium', exp:'namedtuple creates tuple subclasses with named fields.' },
      { q:'Which is Python stack data structure?', opts:['dict','list with append/pop','tuple','set'], ans:1, d:'easy', exp:'A list acts as a stack using append() and pop().' },
    ],
  },
  Database: {
    'SQL Joins': [
      { q:'What does INNER JOIN return?', opts:['All rows from left','All rows from both','Only matching rows','All rows from right'], ans:2, d:'easy', exp:'INNER JOIN returns only rows where the condition is satisfied in both tables.' },
      { q:'What does LEFT JOIN return?', opts:['All right rows, matched left','All left rows, NULLs for unmatched right','Only matching rows','All rows from both'], ans:1, d:'easy', exp:'LEFT JOIN returns all left rows; unmatched right = NULL.' },
      { q:'What is a CROSS JOIN?', opts:['Cross-column condition','Cartesian product of both tables','Joins NULL values','Same as INNER JOIN'], ans:1, d:'medium', exp:'CROSS JOIN produces every combination (n x m rows).' },
      { q:'Which join returns rows only in the right table?', opts:['LEFT JOIN','INNER JOIN','RIGHT JOIN with NULL left check','FULL OUTER JOIN'], ans:2, d:'medium', exp:'RIGHT JOIN with WHERE left.id IS NULL.' },
      { q:'What is a SELF JOIN?', opts:['Table joined to itself','Join on same column name','Join with no condition','Join inside subquery'], ans:0, d:'medium', exp:'SELF JOIN joins a table to itself using aliases.' },
      { q:'Difference between WHERE and HAVING?', opts:['No difference','WHERE filters rows before grouping; HAVING after','HAVING before; WHERE after','HAVING with JOINs only'], ans:1, d:'medium', exp:'WHERE filters rows; HAVING filters groups after GROUP BY.' },
      { q:'What does FULL OUTER JOIN return?', opts:['Only matching rows','All left with NULLs for unmatched','All rows from both with NULLs for non-matching','Same as CROSS JOIN'], ans:2, d:'medium', exp:'FULL OUTER JOIN returns all rows from both tables.' },
      { q:'What is a NATURAL JOIN?', opts:['Join without ON matching on common column names','Join based on foreign keys','Excludes NULLs','INNER JOIN with ORDER BY'], ans:0, d:'hard', exp:'NATURAL JOIN auto-joins on all columns with the same name.' },
      { q:'Which clause filters JOIN rows?', opts:['HAVING','GROUP BY','WHERE','ORDER BY'], ans:2, d:'easy', exp:'WHERE filters rows after the JOIN condition.' },
      { q:'What happens joining on a non-unique column?', opts:['Error','Only first match','Multiple rows may be produced','NULL for duplicates'], ans:2, d:'hard', exp:'Joining on non-unique values creates row multiplication.' },
      { q:'Default JOIN type when only JOIN is specified?', opts:['CROSS JOIN','LEFT JOIN','INNER JOIN','OUTER JOIN'], ans:2, d:'easy', exp:'JOIN without qualifier defaults to INNER JOIN.' },
      { q:'Purpose of table aliases in JOINs?', opts:['Required for JOINs','Improve performance','Shorten references and allow self-joins','Enable index usage'], ans:2, d:'easy', exp:'Aliases provide shorter names or allow self-joins.' },
      { q:'What is a theta join?', opts:['Join using any comparison operator','Trigonometric join','Join on theta columns','Same as equi-join'], ans:0, d:'hard', exp:'Theta join uses operators like >, <, != not just equality.' },
      { q:'Can you JOIN more than two tables?', opts:['No, max two','Yes, by chaining multiple JOINs','Only with subqueries','Only with UNION'], ans:1, d:'easy', exp:'Multiple tables: SELECT ... FROM A JOIN B ON ... JOIN C ON ...' },
      { q:'What is the ON clause in a JOIN?', opts:['Output columns','Join condition','Order results','Filter grouped results'], ans:1, d:'easy', exp:'ON specifies the condition for matching rows.' },
    ],
    Indexing: [
      { q:'Primary purpose of a database index?', opts:['Store backup data','Speed up data retrieval','Compress data','Enforce data types'], ans:1, d:'easy', exp:'Indexes improve query speed without scanning full table.' },
      { q:'Data structure most databases use for indexes?', opts:['Hash table','B-Tree or B+ Tree','Binary search tree','Linked list'], ans:1, d:'medium', exp:'B-Tree and B+ Tree are used for balanced structure and range queries.' },
      { q:'Main trade-off of too many indexes?', opts:['Better read speed','Slower writes and more storage','Better compression','Faster DELETE'], ans:1, d:'medium', exp:'Indexes slow INSERT/UPDATE/DELETE and use extra disk space.' },
      { q:'What is a composite index?', opts:['Index on multiple tables','Index on multiple columns','Index for composite types','Partitioned index'], ans:1, d:'medium', exp:'A composite index covers multiple columns.' },
      { q:'What is a clustered index?', opts:['Groups similar values','Data rows physically sorted by index key','Index on foreign keys','Compresses data'], ans:1, d:'medium', exp:'Clustered index determines physical row order; only one per table.' },
      { q:'What is a covering index?', opts:['Index over multiple tables','Satisfies query entirely without table lookup','Covers NULL values','Spans all rows'], ans:1, d:'hard', exp:'Covering index satisfies a query from the index alone.' },
      { q:'What is index selectivity?', opts:['Number of indexes','How unique values are (higher = better)','Index size','Column order'], ans:1, d:'hard', exp:'High selectivity makes an index more effective for filtering.' },
      { q:'When does full table scan occur despite an index?', opts:['Never','When fetching large % of rows or conditions not met','Only for SELECT *','When ORDER BY used'], ans:1, d:'hard', exp:'Optimizer chooses full scan when fetching large percentage of rows.' },
      { q:'What is a partial index?', opts:['Covers half the table','Indexes subset of rows based on condition','Incomplete index','Hash index'], ans:1, d:'hard', exp:'Partial index e.g. WHERE status = active saves space.' },
      { q:'SQL statement to check index usage?', opts:['DESCRIBE','ANALYZE','EXPLAIN','PROFILE'], ans:2, d:'medium', exp:'EXPLAIN shows the query execution plan including index usage.' },
      { q:'Difference between unique and non-unique indexes?', opts:['Unique is faster','Unique enforces no duplicate values','Non-unique cannot sort','No difference'], ans:1, d:'easy', exp:'UNIQUE INDEX enforces uniqueness.' },
      { q:'What is index fragmentation?', opts:['Missing index columns','Logical disorder causing performance degradation','Too many columns','Index on NULL columns'], ans:1, d:'hard', exp:'Fragmentation happens when index pages become disordered.' },
      { q:'Index type supporting full-text search?', opts:['B-Tree','Hash','Full-Text Index','Bitmap'], ans:2, d:'medium', exp:'Full-text indexes enable efficient text search on large columns.' },
      { q:'Hash index best suited for?', opts:['Range queries','Exact equality lookups','Sorting','Large table joins'], ans:1, d:'medium', exp:'Hash indexes are optimal for exact equality comparisons.' },
      { q:'Can a table have no primary key?', opts:['No, always required','Yes, but discouraged','Only for temp tables','Only in NoSQL'], ans:1, d:'medium', exp:'A table can exist without a primary key but it is bad practice.' },
    ],
    Normalization: [
      { q:'Goal of database normalization?', opts:['Increase query speed','Reduce redundancy and improve integrity','Add more tables','Compress data'], ans:1, d:'easy', exp:'Normalization eliminates redundancy and ensures integrity.' },
      { q:'A table is in 1NF if?', opts:['Has a primary key','All values atomic and unique column names','No foreign keys','All rows unique'], ans:1, d:'medium', exp:'1NF requires atomic values, unique column names, no repeating groups.' },
      { q:'What violates 2NF?', opts:['Composite primary key','Non-key column depends on part of composite key','NULL values','No indexes'], ans:1, d:'medium', exp:'2NF violated when non-key depends on only part of composite key.' },
      { q:'What is a transitive dependency?', opts:['Dependency on foreign key','Non-key depends on another non-key','Across tables','Recursive'], ans:1, d:'medium', exp:'A depends on B depends on C: transitive.' },
      { q:'What does 3NF eliminate?', opts:['Partial dependencies','Transitive dependencies','All redundancy','Multi-valued dependencies'], ans:1, d:'medium', exp:'3NF removes transitive dependencies.' },
      { q:'What is BCNF?', opts:['Stricter 3NF where every determinant is a candidate key','Same as 3NF','For multi-valued dependencies','Eliminates NULLs'], ans:0, d:'hard', exp:'For every X -> Y, X must be a superkey.' },
      { q:'What is denormalization?', opts:['Converting 3NF to 1NF','Introducing redundancy to improve read performance','Removing indexes','Adding constraints'], ans:1, d:'medium', exp:'Denormalization trades redundancy for faster queries.' },
      { q:'What is a functional dependency?', opts:['Stored function dependency','X -> Y: knowing X uniquely determines Y','Foreign key reference','Trigger dependency'], ans:1, d:'medium', exp:'Functional dependency: value of X uniquely determines Y.' },
      { q:'What is 4NF concerned with?', opts:['Transitive dependencies','Multi-valued dependencies','Join dependencies','Partial dependencies'], ans:1, d:'hard', exp:'4NF eliminates non-trivial multi-valued dependencies.' },
      { q:'Which normal form removes partial dependencies?', opts:['1NF','2NF','3NF','BCNF'], ans:1, d:'medium', exp:'2NF requires full functional dependency on the whole key.' },
      { q:'What is a candidate key?', opts:['Any foreign key','Minimal set that uniquely identifies a row','First column','Column with no NULLs'], ans:1, d:'medium', exp:'A candidate key is any minimal superkey.' },
      { q:'What is a prime attribute?', opts:['Primary key column','Attribute that is part of any candidate key','No-NULL column','First defined column'], ans:1, d:'hard', exp:'Prime attributes belong to at least one candidate key.' },
      { q:'1NF but NOT 2NF when?', opts:['No primary key','Partial dependency on composite key','Transitive dependencies','Multi-valued dependencies'], ans:1, d:'medium', exp:'Non-key attributes depend on only part of composite key.' },
      { q:'First step in normalization?', opts:['Remove transitive dependencies','Ensure relation is in 1NF','Add primary key','Create indexes'], ans:1, d:'easy', exp:'1NF is the base requirement.' },
      { q:'What is a surrogate key?', opts:['Natural business key','Artificial key with no business meaning','Multi-column key','External key'], ans:1, d:'medium', exp:'Surrogate keys are system-generated (auto-increment, UUID).' },
    ],
  },
  Aptitude: {
    Quantitative: [
      { q:'What is 15% of 240?', opts:['34','36','38','32'], ans:1, d:'easy', exp:'15% of 240 = 36.' },
      { q:'Train 150m long passes a pole in 15 seconds. Speed in km/h?', opts:['36','40','45','54'], ans:0, d:'medium', exp:'Speed = 150/15 = 10 m/s = 36 km/h.' },
      { q:'A does job in 10 days, B in 15 days. Days to complete together?', opts:['5','6','7','8'], ans:1, d:'medium', exp:'1/10 + 1/15 = 1/6. Time = 6 days.' },
      { q:'Simple interest on 5000 at 8% for 3 years?', opts:['1000','1200','1500','900'], ans:1, d:'easy', exp:'SI = 5000 x 8 x 3 / 100 = 1200.' },
      { q:'Ratio of boys to girls 3:2, 60 students total. How many girls?', opts:['24','36','30','20'], ans:0, d:'easy', exp:'Girls = (2/5) x 60 = 24.' },
      { q:'LCM of 12 and 18?', opts:['6','36','72','216'], ans:1, d:'easy', exp:'LCM(12, 18) = 36.' },
      { q:'20% discount on 500. Selling price?', opts:['400','450','380','480'], ans:0, d:'easy', exp:'Discount = 100. SP = 400.' },
      { q:'If 3x + 7 = 22, what is x?', opts:['3','4','5','6'], ans:2, d:'easy', exp:'3x = 15, x = 5.' },
      { q:'Area of circle with radius 7 (pi = 22/7)?', opts:['154','144','176','168'], ans:0, d:'easy', exp:'Area = 22/7 x 49 = 154.' },
      { q:'Two numbers ratio 5:3, sum 64. The numbers?', opts:['40 and 24','35 and 29','38 and 26','45 and 19'], ans:0, d:'medium', exp:'8k = 64, k = 8. Numbers = 40 and 24.' },
      { q:'Compound interest on 10000 at 10% for 2 years?', opts:['2000','2100','2200','1900'], ans:1, d:'medium', exp:'CI = 10000(1.1)^2 - 10000 = 2100.' },
      { q:'Car covers 300 km in 5 hours. Speed?', opts:['50','60','55','65'], ans:1, d:'easy', exp:'300/5 = 60 km/h.' },
      { q:'HCF of 48 and 36?', opts:['6','9','12','18'], ans:2, d:'easy', exp:'HCF(48, 36) = 12.' },
      { q:'Average of 15, 25, 35, 45, 55?', opts:['30','35','40','45'], ans:1, d:'easy', exp:'175/5 = 35.' },
      { q:'Price increases 25% then decreases 25%. Net change?', opts:['No change','-6.25%','+6.25%','-25%'], ans:1, d:'hard', exp:'1.25 x 0.75 = 0.9375, so -6.25%.' },
    ],
    'Logical Reasoning': [
      { q:'All cats are animals. All animals have legs. Therefore?', opts:['All animals are cats','Some cats may not have legs','All cats have legs','No cats have legs'], ans:2, d:'easy', exp:'All cats are animals -> All animals have legs -> All cats have legs.' },
      { q:'Which number comes next: 2, 6, 12, 20, 30?', opts:['40','42','44','36'], ans:1, d:'medium', exp:'Pattern n(n+1): 6x7 = 42.' },
      { q:'Pointing at a man, a woman says his mother is my mothers daughter. Relation?', opts:['Brother','Son','Uncle','Nephew'], ans:1, d:'medium', exp:'My mothers daughter = woman herself. So he is her son.' },
      { q:'A is older than B, B is older than C. Who is youngest?', opts:['A','B','C','Cannot determine'], ans:2, d:'easy', exp:'A > B > C. C is youngest.' },
      { q:'Odd one out: Circle, Triangle, Square, Cone?', opts:['Circle','Triangle','Square','Cone'], ans:3, d:'easy', exp:'Cone is 3D; others are 2D shapes.' },
      { q:'All flowers are plants. Some plants are trees. Conclusion: Some flowers are trees?', opts:['True','False','Partially true','Cannot determine'], ans:3, d:'medium', exp:'Cannot determine — some trees may not be flowers.' },
      { q:'In a row, Rahul is 10th from left and 20th from right. Total people?', opts:['28','29','30','31'], ans:1, d:'medium', exp:'Total = 10 + 20 - 1 = 29.' },
      { q:'Book : Library :: Painting : ?', opts:['Artist','Museum','Canvas','Gallery'], ans:3, d:'easy', exp:'Paintings are displayed in a Gallery.' },
      { q:'Cube painted red, cut into 27 pieces. Cubes with exactly 2 red faces?', opts:['6','8','12','24'], ans:2, d:'hard', exp:'Edge pieces have 2 painted faces. 12 edges × 1 middle = 12.' },
      { q:'Odd one out: 8, 27, 64, 100, 125?', opts:['8','27','100','125'], ans:2, d:'medium', exp:'8, 27, 64, 125 are perfect cubes. 100 is not.' },
      { q:'Statement logic: No A is B. Some B are C. Conclusion?', opts:['Some A are C','No A is C','Some C are not A','Cannot determine relation of A and C'], ans:3, d:'hard', exp:'We cannot definitively conclude about A and C.' },
      { q:'A sequence: 1, 1, 2, 3, 5, 8, 13, ?', opts:['18','19','20','21'], ans:3, d:'easy', exp:'Fibonacci sequence: 8 + 13 = 21.' },
      { q:'If FRIEND is coded as HUMJTK, how is CANDLE coded?', opts:['ECOFLG','ECPFNG','DCPFMG','EBNCKF'], ans:1, d:'hard', exp:'Each letter shifted +2: CANDLE -> ECPFNG.' },
    ],
  },
  DSA: {
    Quizzes: [
      // Old Arrays Quizzes
      { q: 'What is the output of this code?', codeSnippet: 'int[] arr = {5, 2, 8, 1, 9};\nArrays.sort(arr);\nSystem.out.println(arr[0] + " " + arr[arr.length-1]);', opts: ['1 9', '5 9', '1 5', '9 1'], ans: 0, d: 'easy', exp: 'Arrays.sort() sorts in ascending order.' },
      { q: 'What is the time complexity of Binary Search?', opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], ans: 2, d: 'easy', exp: 'Binary search splits by half → O(log n).' },
      { q: 'What does this code print?', codeSnippet: 'int[] a = {10, 20, 30};\nint sum = 0;\nfor (int x : a) sum += x;\nSystem.out.println(sum / a.length);', opts: ['20', '60', '10', '30'], ans: 0, d: 'easy', exp: 'sum=60, a.length=3 → 20.' },
      { q: 'Which searching algorithm requires a sorted array?', opts: ['Linear Search', 'Binary Search', 'Jump Search is the only one', 'Both B and C'], ans: 3, d: 'medium', exp: 'Binary Search and Jump Search require sorted arrays.' },
      { q: 'What is the worst-case time complexity of Bubble Sort?', opts: ['O(n log n)', 'O(log n)', 'O(n)', 'O(n²)'], ans: 3, d: 'easy', exp: 'Compares every pair → O(n²).' },
      { q: 'What does this Python snippet output?', codeSnippet: 'nums = [3, 1, 4, 1, 5, 9]\nprint(max(nums) - min(nums))', opts: ['8', '6', '9', '5'], ans: 0, d: 'easy', exp: '9 - 1 = 8.' },
      { q: 'What is the space complexity of Merge Sort?', opts: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], ans: 2, d: 'medium', exp: 'Auxiliary array for merging requires O(n) space.' },
      { q: 'What does this code output?', codeSnippet: 'arr = [1, 2, 3, 4, 5]\nprint(arr[1:4])', opts: ['[2, 3, 4]', '[1, 2, 3]', '[2, 3, 4, 5]', '[1, 2, 3, 4]'], ans: 0, d: 'easy', exp: 'Slicing [1:4] gets indices 1, 2, 3.' },
      // Old LinkedLists Quizzes
      { q: 'What is the time complexity of inserting at the head of a Linked List?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2, d: 'easy', exp: 'Head insertion is O(1).' },
      { q: 'What does this represent?', codeSnippet: 'class Node {\n    int data;\n    Node next;\n    Node(int d) { data = d; next = null; }\n}', opts: ['A Stack', 'A Queue node', 'A Linked List node', 'A Tree node'], ans: 2, d: 'easy', exp: 'Node with data and next constitutes a Linked List node.' },
      { q: 'Which of the following CANNOT be done in O(1) with a Singly Linked List?', opts: ['Insert at head', 'Delete head node', 'Access middle element', 'Check if list is empty'], ans: 2, d: 'medium', exp: 'Accessing middle requires O(n) traversal.' },
      { q: 'What is a Doubly Linked List?', opts: ['Two separate lists', 'Each node has next and prev pointers', 'A circular list', 'Two values per node'], ans: 1, d: 'easy', exp: 'Nodes contain next and previous pointers.' },
      { q: 'How do you detect a cycle in a Linked List?', opts: ['Sort the list', 'Count nodes', "Floyd's Tortoise and Hare (two pointers)", 'Use a stack'], ans: 2, d: 'medium', exp: "Floyd's algorithm detects cycles in O(n) without extra space." },
      { q: 'What does this code do?', codeSnippet: 'Node curr = head;\nwhile (curr.next != null) {\n    curr = curr.next;\n}\nreturn curr.data;', opts: ['Returns head', 'Returns middle element', 'Returns tail element', 'Reverses list'], ans: 2, d: 'easy', exp: 'Moves to the last node and returns its data.' },
      // Old Recursion Quizzes
      { q: 'What is the base case in this recursive function?', codeSnippet: 'function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}', opts: ['n * factorial(n-1)', 'n === 0', 'factorial(n)', 'return 1 always'], ans: 1, d: 'easy', exp: 'Base case is the terminating condition n === 0.' },
      { q: 'What does this function return for fib(5)?', codeSnippet: 'def fib(n):\n    if n <= 1: return n\n    return fib(n-1) + fib(n-2)', opts: ['3', '4', '5', '8'], ans: 2, d: 'medium', exp: 'fib(5) = 5.' },
      { q: 'What is the time complexity of naive recursive Fibonacci?', opts: ['O(n)', 'O(n log n)', 'O(2ⁿ)', 'O(log n)'], ans: 2, d: 'medium', exp: 'Branching twice at each step produces O(2ⁿ) time complexity.' },
      { q: 'What is tail recursion?', opts: ['Recursion inside a loop', 'Recursive call is the last operation in the function', 'Using two recursive calls', 'Recursion without a base case'], ans: 1, d: 'medium', exp: 'Tail recursion helps avoid stack overflow by reusing the frame.' },
      // Old Stacks & Queues Quizzes
      { q: 'What principle does a Stack follow?', opts: ['FIFO', 'LIFO', 'Priority based', 'Random access'], ans: 1, d: 'easy', exp: 'Stack is Last-In-First-Out.' },
      { q: 'What does this code print?', codeSnippet: 'stack = []\nstack.append(1)\nstack.append(2)\nstack.append(3)\nprint(stack.pop())', opts: ['1', '2', '3', 'Error'], ans: 2, d: 'easy', exp: 'pop() returns the last inserted element: 3.' },
      { q: 'Which structure is used to implement BFS?', opts: ['Stack', 'Heap', 'Queue', 'Array'], ans: 2, d: 'medium', exp: 'Breadth-First Search uses a Queue.' },
      { q: 'What is the time complexity of push and pop in a Stack?', opts: ['O(n)', 'O(log n)', 'O(1)', 'O(n²)'], ans: 2, d: 'easy', exp: 'Both operations are O(1).' },
      { q: 'What does this Java code do?', codeSnippet: 'Stack<Integer> s = new Stack<>();\ns.push(10); s.push(20); s.push(30);\nwhile (!s.isEmpty()) {\n    System.out.print(s.pop() + " ");\n}', opts: ['10 20 30', '30 20 10', '20 10 30', 'Throws exception'], ans: 1, d: 'easy', exp: 'Pops out in LIFO order: 30 20 10.' },

      // NEW Added Quizzes
      { q: 'What is the maximum number of nodes at level "l" of a binary tree?', opts: ['2^l', 'l^2', '2l', '2^(l-1)'], ans: 0, d: 'medium', exp: 'Maximum nodes for a level l (starting at 0) is 2^l.' },
      { q: 'Which of the following data structures is typically used to implement a Priority Queue?', opts: ['Linked List', 'Array', 'Heap', 'Stack'], ans: 2, d: 'medium', exp: 'Heaps guarantee O(1) peek and O(log n) add for priorities.' },
      { q: 'What is the worst-case time complexity of inserting a node into a Binary Search Tree (BST)?', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], ans: 1, d: 'medium', exp: 'If the BST is completely skewed (like a linked list), insertion takes O(n).' },
      { q: 'Which hashing resolution technique places the collided element in the next available slot?', opts: ['Separate Chaining', 'Linear Probing', 'Quadratic Probing', 'Double Hashing'], ans: 1, d: 'easy', exp: 'Linear Probing steps linearly until a free slot is found.' },
      { q: 'Which sorting algorithm is heavily used inside the standard library (like Java Arrays.sort() for objects)?', opts: ['Quick Sort', 'Merge Sort', 'TimSort', 'Heap Sort'], ans: 2, d: 'hard', exp: 'TimSort is a hybrid of Merge Sort and Insertion Sort used widely.' },
      { q: 'What does DFS stand for?', opts: ['Direct File System', 'Depth-First Search', 'Dual Flow Storage', 'Breadth-First Search'], ans: 1, d: 'easy', exp: 'Depth-First Search explores deeply into a branch before backtracking.' },
      { q: 'How many edges does a Tree with N nodes contain?', opts: ['N', 'N-1', 'N+1', 'N/2'], ans: 1, d: 'easy', exp: 'A tree with N nodes always has strictly N-1 edges.' },
      { q: 'Which graph algorithm finds the shortest path from a single source to all other nodes?', opts: ["Kruskal's Algorithm", "Prim's Algorithm", "Dijkstra's Algorithm", "Floyd-Warshall Algorithm"], ans: 2, d: 'medium', exp: "Dijkstra's finds the single-source shortest path." }
    ],
    'Coding Problems': [
      // Old Array Execution Tasks
      {
        q: 'Write a function "findMax" that returns the maximum value in an array.\nExample: findMax([3, 1, 9, 2]) → 9',
        opts: [], ans: 1, d: 'easy', exp: 'Iterate through the array keeping track of the current maximum.',
        isExecutionTask: true, codeSnippet: 'function findMax(arr) {\n  // your code here\n}',
        testCases: [{ input: 'findMax([3,1,9,2])', expectedOutput: '9' }, { input: 'findMax([-5,-1,-3])', expectedOutput: '-1' }]
      },
      {
        q: 'Write a function "reverseArray" that reverses an array in-place.\nExample: reverseArray([1,2,3]) → [3,2,1]',
        opts: [], ans: 1, d: 'medium', exp: 'Use two pointers swapping elements from both ends toward the center.',
        isExecutionTask: true, codeSnippet: 'function reverseArray(arr) {\n  // your code here\n  return arr;\n}',
        testCases: [{ input: 'reverseArray([1,2,3])', expectedOutput: '[3,2,1]' }]
      },
      // Old LinkedList Execution Task
      {
        q: 'Write a function that adds a number to the end of a linked list represented as an array-based simulation.\nreturn the new length.',
        opts: [], ans: 1, d: 'easy', exp: 'Push to array and return length.',
        isExecutionTask: true, codeSnippet: 'function addToEnd(list, val) {\n  // your code here\n}',
        testCases: [{ input: 'addToEnd([1,2,3], 4)', expectedOutput: '4' }]
      },
      // Old Recursion Execution Tasks
      {
        q: 'Write a recursive function "sumDigits" that returns the sum of digits of a positive integer.\nExample: sumDigits(123) → 6',
        opts: [], ans: 1, d: 'medium', exp: 'Base case: n < 10 returns n. Recursive: n%10 + sumDigits(Math.floor(n/10)).',
        isExecutionTask: true, codeSnippet: 'function sumDigits(n) {\n  // your code here\n}',
        testCases: [{ input: 'sumDigits(123)', expectedOutput: '6' }, { input: 'sumDigits(9)', expectedOutput: '9' }]
      },
      {
        q: 'Write a function "power" that computes base^exp recursively.\nExample: power(2, 10) → 1024',
        opts: [], ans: 1, d: 'medium', exp: 'power(base, exp) = base * power(base, exp-1). Base case: exp===0 returns 1.',
        isExecutionTask: true, codeSnippet: 'function power(base, exp) {\n  // your code here\n}',
        testCases: [{ input: 'power(2, 10)', expectedOutput: '1024' }, { input: 'power(3, 3)', expectedOutput: '27' }]
      },
      // Old StacksQueues Execution Task
      {
        q: 'Write a function "isBalanced" that checks if brackets are balanced.\nExample: isBalanced("({[]})") → true, isBalanced("({)}") → false',
        opts: [], ans: 1, d: 'hard', exp: 'Use a stack: push open brackets, pop on matching close bracket.',
        isExecutionTask: true, codeSnippet: 'function isBalanced(s) {\n  // your code here\n  // return true or false\n}',
        testCases: [{ input: 'isBalanced("({[]})")', expectedOutput: 'true' }, { input: 'isBalanced("({)}")', expectedOutput: 'false' }]
      },

      // NEW Added Execution Tasks (Coding Problems)
      {
        q: 'Write a function "twoSum" that returns the [index1, index2] of two numbers in an array that add up to a target.\nExample: twoSum([2,7,11,15], 9) → [0,1]',
        opts: [], ans: 1, d: 'medium', exp: 'Use a Hash Map to store elements and their complement indices for O(n) time.',
        isExecutionTask: true, codeSnippet: 'function twoSum(nums, target) {\n  // your code here\n}',
        testCases: [{ input: 'twoSum([2,7,11,15], 9)', expectedOutput: '[0,1]' }, { input: 'twoSum([3,2,4], 6)', expectedOutput: '[1,2]' }]
      },
      {
        q: 'Write a function "isPalindrome" that checks if a string is identical forward and backward.\nExample: isPalindrome("racecar") → true',
        opts: [], ans: 1, d: 'easy', exp: 'Compare the string to its reversed version, or use two pointers converging to the center.',
        isExecutionTask: true, codeSnippet: 'function isPalindrome(str) {\n  // your code here\n}',
        testCases: [{ input: 'isPalindrome("racecar")', expectedOutput: 'true' }, { input: 'isPalindrome("hello")', expectedOutput: 'false' }]
      },
      {
        q: 'Write a function "containsDuplicate" that returns true if an array contains any duplicate values, else false.\nExample: containsDuplicate([1,2,3,1]) → true',
        opts: [], ans: 1, d: 'easy', exp: 'By turning the array into a Set, you can compare the length of the array to the length of the Set.',
        isExecutionTask: true, codeSnippet: 'function containsDuplicate(nums) {\n  // your code here\n}',
        testCases: [{ input: 'containsDuplicate([1,2,3,1])', expectedOutput: 'true' }, { input: 'containsDuplicate([5,6,7,8])', expectedOutput: 'false' }]
      },
      {
        q: 'Write a function "mergeSortedArrays" that takes two sorted arrays and merges them into a single sorted array.\nExample: merge([1,3], [2,4]) → [1,2,3,4]',
        opts: [], ans: 1, d: 'medium', exp: 'Use two pointers from the beginning of each array to iteratively push the lowest value into a new array.',
        isExecutionTask: true, codeSnippet: 'function mergeSortedArrays(arr1, arr2) {\n  // your code here\n}',
        testCases: [{ input: 'mergeSortedArrays([1,3], [2,4])', expectedOutput: '[1,2,3,4]' }]
      },
      {
        q: 'Write a function "fibonacci" that returns the nth fibonacci number.\nExample: fibonacci(4) → 3 (Sequence: 0, 1, 1, 2, 3...)',
        opts: [], ans: 1, d: 'medium', exp: 'Can be done recursively, recursively with memoization, or iteratively.',
        isExecutionTask: true, codeSnippet: 'function fibonacci(n) {\n  // your code here\n}',
        testCases: [{ input: 'fibonacci(4)', expectedOutput: '3' }, { input: 'fibonacci(10)', expectedOutput: '55' }]
      },
      {
        q: 'Write a function "factorial" that computes the factorial of n.\nExample: factorial(5) → 120',
        opts: [], ans: 1, d: 'easy', exp: 'n! = n * (n-1) * ... * 1. Base case: factorial(0) = 1.',
        isExecutionTask: true, codeSnippet: 'function factorial(n) {\n  // your code here\n}',
        testCases: [{ input: 'factorial(5)', expectedOutput: '120' }, { input: 'factorial(0)', expectedOutput: '1' }]
      },
      {
        q: 'Write a function "maxSubArray" that finds the contiguous subarray with the largest sum.\\nExample: maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) → 6',
        opts: [], ans: 1, d: 'hard', exp: "Use Kadane's algorithm to keep track of the current maximum subarray sum.",
        isExecutionTask: true, codeSnippet: 'function maxSubArray(nums) {\n  // your code here\n}',
        testCases: [{ input: 'maxSubArray([-2,1,-3,4,-1,2,1,-5,4])', expectedOutput: '6' }, { input: 'maxSubArray([1])', expectedOutput: '1' }]
      },
      {
        q: 'Write a function "removeDuplicates" that removes duplicates from a sorted array in-place and returns the new length.\nExample: removeDuplicates([1,1,2]) → 2',
        opts: [], ans: 1, d: 'medium', exp: 'Use a two-pointer approach to overwrite duplicates.',
        isExecutionTask: true, codeSnippet: 'function removeDuplicates(nums) {\n  // your code here\n}',
        testCases: [{ input: 'removeDuplicates([1,1,2])', expectedOutput: '2' }, { input: 'removeDuplicates([0,0,1,1,1,2,2,3,3,4])', expectedOutput: '5' }]
      },
      {
        q: 'Write a function "missingNumber" that finds the missing number in an array of size n containing numbers from 0 to n.\nExample: missingNumber([3,0,1]) → 2',
        opts: [], ans: 1, d: 'easy', exp: 'Calculate the expected sum using n*(n+1)/2 and subtract the actual array sum.',
        isExecutionTask: true, codeSnippet: 'function missingNumber(nums) {\n  // your code here\n}',
        testCases: [{ input: 'missingNumber([3,0,1])', expectedOutput: '2' }, { input: 'missingNumber([0,1])', expectedOutput: '2' }]
      }
    ]
  },
  'Web Development': {
    'HTML and CSS': [
      { q: 'What does HTML stand for?', opts: ['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'Hyper Tool Markup Language'], ans: 0, d: 'easy', exp: 'HTML is Hyper Text Markup Language.' },
      { q: 'Which CSS property controls text size?', opts: ['font-style', 'text-size', 'font-size', 'text-style'], ans: 2, d: 'easy', exp: 'font-size controls the size of the text.' },
      { q: 'How do you make a list that lists its items with squares?', opts: ['list-type: square;', 'list-style-type: square;', 'type: square;', 'list: square;'], ans: 1, d: 'medium', exp: 'list-style-type: square; is the correct CSS property.' },
      { q: 'What is the correct HTML element for the largest heading?', opts: ['<heading>', '<h6>', '<head>', '<h1>'], ans: 3, d: 'easy', exp: '<h1> defines the most important heading.' },
      { q: 'What is the default value of the position property?', opts: ['relative', 'fixed', 'absolute', 'static'], ans: 3, d: 'medium', exp: 'Elements are positioned static by default.' },
      { q: 'How do you select an element with id "demo"?', opts: ['#demo', '.demo', 'demo', '*demo'], ans: 0, d: 'easy', exp: '# is the id selector in CSS.' },
      { q: 'Which HTML attribute is used to define inline styles?', opts: ['font', 'class', 'styles', 'style'], ans: 3, d: 'easy', exp: 'The style attribute is used to specify inline styles.' },
      { q: 'What is the correct CSS syntax to make all the <p> elements bold?', opts: ['p {text-size:bold;}', 'p {font-weight:bold;}', '<p style="text-size:bold;">', 'p {font-style:bold;}'], ans: 1, d: 'medium', exp: 'font-weight:bold; makes text bold.' },
      { q: 'Which property is used to change the background color?', opts: ['bgcolor', 'color', 'background-color', 'background'], ans: 2, d: 'easy', exp: 'background-color is used for background color.' },
      { q: 'How do you display hyperlinks without an underline?', opts: ['a {text-decoration:none;}', 'a {underline:none;}', 'a {decoration:no-underline;}', 'a {text-decoration:no-underline;}'], ans: 0, d: 'medium', exp: 'text-decoration:none removes the underline.' }
    ],
    'JavaScript': [
      { q: 'Inside which HTML element do we put the JavaScript?', opts: ['<js>', '<javascript>', '<script>', '<scripting>'], ans: 2, d: 'easy', exp: '<script> tag is used to embed client-side scripts.' },
      { q: 'How do you write "Hello World" in an alert box?', opts: ['msg("Hello World");', 'alert("Hello World");', 'msgBox("Hello World");', 'alertBox("Hello World");'], ans: 1, d: 'easy', exp: 'alert() displays an alert box.' },
      { q: 'How do you create a function in JavaScript?', opts: ['function = myFunction()', 'function myFunction()', 'function:myFunction()', 'create myFunction()'], ans: 1, d: 'easy', exp: 'function myFunction() defines a function.' },
      { q: 'How to write an IF statement in JavaScript?', opts: ['if i = 5 then', 'if i == 5 then', 'if (i == 5)', 'if i = 5'], ans: 2, d: 'easy', exp: 'if (condition) is the correct syntax.' },
      { q: 'How does a FOR loop start?', opts: ['for (i = 0; i <= 5)', 'for (i = 0; i <= 5; i++)', 'for i = 1 to 5', 'for (i <= 5; i++)'], ans: 1, d: 'medium', exp: 'for (initialization; condition; increment)' },
      { q: 'What is the correct way to write a JavaScript array?', opts: ['var colors = 1 = ("red"), 2 = ("green")', 'var colors = "red", "green"', 'var colors = (1:"red", 2:"green")', 'var colors = ["red", "green"]'], ans: 3, d: 'easy', exp: 'Arrays use square brackets [].' },
      { q: 'Which event occurs when the user clicks on an HTML element?', opts: ['onchange', 'onmouseclick', 'onmouseover', 'onclick'], ans: 3, d: 'easy', exp: 'onclick event fires on a mouse click.' },
      { q: 'How do you declare a JavaScript variable?', opts: ['v carName;', 'variable carName;', 'var carName;', 'None of the above'], ans: 2, d: 'easy', exp: 'var, let, or const declare variables.' },
      { q: 'Which operator is used to assign a value to a variable?', opts: ['*', '-', '=', 'x'], ans: 2, d: 'easy', exp: '= is the assignment operator.' },
      { q: 'What will typeof [] return?', opts: ['"array"', '"object"', '"list"', '"undefined"'], ans: 1, d: 'medium', exp: 'Arrays are a special type of objects in JavaScript.' }
    ],
    'React': [
      { q: 'What is React?', opts: ['A backend framework', 'A JavaScript library for building user interfaces', 'A database', 'A language'], ans: 1, d: 'easy', exp: 'React is a library for UIs.' },
      { q: 'Which command is used to create a new React app?', opts: ['npx create-react-app my-app', 'npm install react', 'npm create react-app', 'npx init react'], ans: 0, d: 'easy', exp: 'npx create-react-app builds the boilerplate.' },
      { q: 'What is JSX?', opts: ['JavaScript XML', 'Java Syntax Extension', 'JSON X', 'JavaScript X'], ans: 0, d: 'easy', exp: 'JSX stands for JavaScript XML.' },
      { q: 'What hook is used to manage state in a functional component?', opts: ['useEffect', 'useContext', 'useState', 'useReducer'], ans: 2, d: 'easy', exp: 'useState allows state management in functional components.' },
      { q: 'How do you pass data from a parent to a child component?', opts: ['Using State', 'Using Props', 'Using Context', 'Using Redux'], ans: 1, d: 'easy', exp: 'Props (properties) pass data downwards.' },
      { q: 'What is the virtual DOM?', opts: ['A direct copy of the real DOM', 'A lightweight JavaScript representation of the DOM', 'A plugin', 'A new HTML standard'], ans: 1, d: 'medium', exp: 'Virtual DOM optimizes rendering by batching updates.' },
      { q: 'Which hook performs side effects?', opts: ['useState', 'useMemo', 'useEffect', 'useRef'], ans: 2, d: 'medium', exp: 'useEffect handles side effects like data fetching.' },
      { q: 'What is the purpose of the key prop in a list?', opts: ['To style the element', 'To uniquely identify elements for efficient re-rendering', 'To pass data', 'To bind an event'], ans: 1, d: 'medium', exp: 'Keys help React identify which items have changed.' },
      { q: 'Can a functional component have state?', opts: ['No, only class components', 'Yes, using hooks', 'Yes, by extending React.Component', 'Only with Redux'], ans: 1, d: 'easy', exp: 'Hooks like useState allow functional components to have state.' },
      { q: 'What does React.StrictMode do?', opts: ['Prevents errors', 'Highlights potential problems in an application', 'Speeds up rendering', 'Minifies code'], ans: 1, d: 'medium', exp: 'StrictMode checks for unsafe lifecycles and legacy API usage.' }
    ]
  }
};

const extraData = require('./extraSeedData.js');

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected. Seeding...');

  // Merge extraData into DATA
  for (const topic in extraData) {
    if (!DATA[topic]) DATA[topic] = {};
    for (const subtopic in extraData[topic]) {
      if (!DATA[topic][subtopic]) {
        DATA[topic][subtopic] = extraData[topic][subtopic];
      } else {
        DATA[topic][subtopic].push(...extraData[topic][subtopic]);
      }
    }
  }

  await Topic.deleteMany();
  await Subtopic.deleteMany();
  await Question.deleteMany();

  for (const [topicName, subtopicsObj] of Object.entries(DATA)) {
    const topic = await Topic.create({ name: topicName, slug: topicName.toLowerCase().replace(/\s/g,'_') });
    for (const [subtopicName, questions] of Object.entries(subtopicsObj)) {
      const subtopic = await Subtopic.create({ name: subtopicName, slug: subtopicName.toLowerCase().replace(/\s/g,'_'), topicId: topic._id });
      const docs = questions.map(q => ({
        topicId: topic._id,
        subtopicId: subtopic._id,
        question: q.q,
        options: q.opts,
        correctAnswer: q.ans,
        difficulty: q.d,
        explanation: q.exp,
        isExecutionTask: q.isExecutionTask || false,
        codeSnippet: q.codeSnippet || '',
        testCases: q.testCases || [],
        language: q.language || 'javascript',
      }));
      await Question.insertMany(docs);
      console.log(`  ${topicName} > ${subtopicName}: ${docs.length} questions`);
    }
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });

