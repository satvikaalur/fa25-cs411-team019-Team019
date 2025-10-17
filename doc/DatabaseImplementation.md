# Database Implementation and Indexing
Link to Google Colab notebook with implementation: https://colab.research.google.com/drive/1qb38Cc8UghqK9IwmKuiNFOEutGq56bTF?usp=sharing

## Implementation
1. Since we are working on Google Colab, the database is run on an individual virtual machine that refeshes every time the notebook is closed or surpasses
   the runtime constraints. Because of this, each time we open the notebook we must run the following commands to redownload and start mySQL along with the database.

insert screenshot

2. Following are the Database Design Language (DDL) commands we used to implement our 5 entity tables and our 1 relationship table. The ENGINE and DEFAULT CHARSET
   specifications for each table guarantee that foreign key constrainsts and all characters are valid when mySQL creates the tables.

#### Customer Table    
  CREATE TABLE IF NOT EXISTS Customer (  
  customerId INT PRIMARY KEY,  
  email VARCHAR(255) NOT NULL UNIQUE,  
  custName VARCHAR(100) NOT NULL,  
  age INT CHECK (age >= 0),  
  gender VARCHAR(20)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;   

#### Email List Table
CREATE TABLE IF NOT EXISTS EmailList (  
  listId INT PRIMARY KEY,  
  listTitle VARCHAR(120) NOT NULL UNIQUE,  
  createdDate DATE NOT NULL  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  

#### Customer-Email List Relationship Table
CREATE TABLE IF NOT EXISTS CustomerEmailList (  
  customerId INT NOT NULL,  
  listId INT NOT NULL,  
  PRIMARY KEY (customerId, listId),  
  FOREIGN KEY (customerId) REFERENCES Customer(customerId)  
    ON UPDATE CASCADE ON DELETE CASCADE,  
  FOREIGN KEY (listId) REFERENCES EmailList(listId)  
    ON UPDATE CASCADE ON DELETE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  

#### Employee Table  
CREATE TABLE IF NOT EXISTS Employee (  
  employeeId INT PRIMARY KEY,  
  empName VARCHAR(100) NOT NULL,  
  empTitle VARCHAR(100),  
  tenure INT CHECK (tenure >= 0)  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  

#### Purchase Table
CREATE TABLE IF NOT EXISTS Purchase (  
  purchaseId INT PRIMARY KEY,  
  customerId INT NOT NULL,  
  purchDate DATE NOT NULL,  
  quantity INT NOT NULL CHECK (quantity > 0),  
  category VARCHAR(50) NOT NULL,  
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),  
  returned BOOLEAN NOT NULL DEFAULT FALSE,  
  FOREIGN KEY (customerId) REFERENCES Customer(customerId)  
    ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  

#### Returns Table
CREATE TABLE IF NOT EXISTS Returns (  
  returnId INT PRIMARY KEY,  
  purchaseId INT NOT NULL UNIQUE,  
  employeeId INT NOT NULL,   
  returnDate DATE NOT NULL,  
  csat_score DECIMAL(3,2) CHECK (csat_score >= 0 AND csat_score <= 5),  
  CONSTRAINT fk_returns_purchase  
    FOREIGN KEY (purchaseId) REFERENCES Purchase(purchaseId)  
    ON UPDATE CASCADE,  
  CONSTRAINT fk_returns_employee  
    FOREIGN KEY (employeeId) REFERENCES Employee(employeeId)  
    ON UPDATE CASCADE  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;  

3. The three tables that have more than 1000 entries are Customer, Purchase, and Returns. The count queries for those tables are in the screenshots below.

## Advanced Queries


## Indexing

