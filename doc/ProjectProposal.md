## Project Proposal: InsightEdge

### Project Summary

**InsightEdge** is a web application that helps eCommerce companies improve product 
quality & manage customer satisfaction by combining customer, purchase, and service data into 
one platform. Our application will have two main features:  

- **Marketing Email Lists**: Generate targeted customer lists for campaigns using preset or 
custom filters based on purchase history, returns, and satisfaction.  

- **Product Dashboard**: Visualize sales, returns, and customer feedback to identify strong 
product categories & areas that need improvement.  

We plan to merge two Kaggle datasets (purchases + customer service interactions) to simulate 
a real eCommerce environment. The system will use relational databases for customers, 
purchases, employees, service calls, and products. The UI provides easy dropdown navigation 
for searching, managing employees, and running campaigns. As more data is added, marketing 
lists & dashboards will become more specific, and allow for personalized outreach.  

**Future outlook**: In the future, we may look to include Machine Learning powered alerts and 
email generation that intend to help companies proactively address satisfaction issues.  

---

### Description + Creative Component

The basic functions of **InsightEdge** include email list generation and a product 
dashboard, along with the ability to search the customer and purchasing databases for any 
specific information and manage their employees. Our two largest components are the creation 
of marketing email lists and the product quality dashboard. Users will be able to generate 
customer email lists for marketing purposes based on certain conditions from customer data. 
There will be some conditional presets that we believe will be useful for marketing campaigns, 
but the application will also allow users to create their own lists based on custom conditions. 
The product dashboard will help companies market their best areas and know what products to 
improve based on the customer purchase and satisfaction. It will use visualizations to show a 
company’s rates of sales and returns for their product categories, and customer feedback such 
as the reason for returns (if applicable) and average quantity per individual purchase.  

---

### Usefulness

There are many similar websites that show data and information like **InsightEdge** does, 
but they are either very complicated to use or only contain functionality for one area of need. 
One of our group members experienced this issue firsthand over the summer during her 
technology and business internship with a small eCommerce company. She noticed that 
customer information & purchase history, marketing strategy, and customer service capabilities 
were separated into different software applications. Many of the tech problems the company 
dealt with stemmed from the lack of connection between these applications, which would delay 
the ability to fulfill orders and respond to customer requests. Our application will provide all of 
this basic functionality in a single place, relying on a consistent source of data to allow for easy 
access to information needed to improve quality and solve problems.  

---

### Data Sources

While we would ultimately prefer to be able to have users use data from their 
eCommerce sites (i.e. Shopify, Etsy, etc), for this iteration of the application we will be using 
eCommerce purchasing and customer service CSV data sets found on Kaggle. The customer 
service data set includes data on a month’s worth of customer service calls from an unnamed 
company. This data does not include any customer names, so we are merging it with a 
purchasing history data set that includes a few years’ worth of transactions from another 
unnamed company. These two datasets include matching product categories, information on 
returns, and the date of purchase/issue. To simulate a real eCommerce environment, we will be 
selecting only the purchases from the same month and year as the customer service calls and 
matching up transactions that had a return in an identical category as a customer service call 
about a return. To make sure the merge is as accurate as possible, we will only match return 
calls that were made at least 24 hours after the purchase and each return will be matched to a 
unique call.  

This merged and cleaned data set will include data for every purchase made from an 
unnamed eCommerce store in 2023. It will contain the customer’s name, age, gender, & id, 
purchase date, product category, quantity, purchase amount, and whether they returned the 
product or not. If the customer did return the product, there will be additional information about 
the date the request was made, the reason for the request, the agent who responded, their 
supervisor, their manager, their length of employment, and a customer satisfaction score. 
Purchases that are not returned will have the mentioned customer service attributes as N/A. In 
total, the merged data set has **17 attributes** and **22,801 purchases** from **16,501 unique 
customers**.  

---

### Functionality

Our plan for the user interface is to have dropdowns, where everything the user needs to 
access is there based on category (Customer information, Employee information, Purchases, 
Products, Email tracking, etc), only taking a few clicks. The user can add and update the emails 
being sent based on certain customer satisfaction as mentioned previously. Updating would 
happen as more customer feedback is sent, so email lists are becoming more specific for 
specific audiences instead of still staying broad. Imagine this as a growing network where the 
more information the company is being fed, the more specific their emails become for their 
audience, helping increase individual customer interaction and satisfaction.  

---

### UI Mockup

**[Insert UI mockup image here]**

The largest square is the home page and the arrows represent what page will load after clicking 
an element on the home page. The individual pages are also reachable from each other via the 
header, and the home page is always accessible by clicking the application name at the top of 
each page.  

---

### Project Work Distribution

For our implementation of InsightEdge, we plan on working very closely with one another 
for every stage of this project. We’ve chosen to elect a lead for each stage of the project to 
manage the team and ensure every member is contributing and on the same page. For Stage 2, 
Satvika will be the lead and will be responsible for the explanations of our database design. 
Catie will create the physical design of the database, Emily will normalize the database, and 
Mahir will convert the conceptual design to the logical design. Stage 3 will be led by Emily and is 
also responsible for the justification and indexing analysis. Satvika will manage the 
implementation of the tables, Mahir will implement the advanced SQL queries, and Catie will 
assist Emily with the indexing, including making any needed data visualizations. Since Stage 4 
involves a lot, both Mahir and Catie will lead. Catie will lead the frontend UI/UX implementation 
and Mahir will lead the implementation of the backend of the application. Satvika will work with 
Catie on the frontend and Emily will work on the backend with Mahir. At this point we do not 
have specific subtasks to identify, but the work will be split equally between all group members. 
The final report will also be a collaborative effort, with each group member taking a few prompts 
that they feel they can respond the best to.  
