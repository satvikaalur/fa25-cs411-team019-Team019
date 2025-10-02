# Database Design

## Entity-Relationship Diagram



## Design Specifics



## Normalization

Functional Dependencies

Customer
customerId → custName, age, gender, email

Employee
employeeId → empName, empTitle, tenure

Purchase
purchaseId → customerId, purchDate, category, quantity, amount

Return
returnId → purchaseId, employeeId, returnDate, csat_score
purchaseId → returnId

EmailList
listId → listTitle, createdDate

This schema is already normalized because we designed the relationships to avoid redundancy from the start. We gave 
each fact its own table with a clear key. Anything that would create overlap or redunduncies was split out. In particular, 
we moved dependent details into their own weak entity, like Return lives in a seperate dependent table; so those attributes 
depend only on the right key. Every non-key attribute depends on the key, satisfying BCNF without further decomposition.

## Logical Design
