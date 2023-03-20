## Creating a data transfer pipeline from an AWS S3 Bucket to Azure Data Lake Storage Gen2

Let's assume we have a data engineering task, where firstly, through some third-party, we daily receive data in AWS cloud. We need to **create a pipeline to copy this data into Azure, validate it and then store the data in Azure SQL DB**.

## S3 Data -

Let's take a look at the data structure in the S3 bucket. 

Bucket -> Year -> Month -> Day -> data files

<img width="941" alt="1_S3bucket" src="https://user-images.githubusercontent.com/71979171/226239089-c72f3282-c116-4b3d-8eee-a39443b1d6ed.PNG">

I will be using **Azure Data Factory** to move/copy the data from the S3 Bucket to a landing folder in **Azure Data Lake Storage**.

## Access Credentials -

I have created a **key vault** to store the Access key ID and Secret access key that I'll use to connect to S3 and given Azure Data Factory (ADF) the permission to access the vault.

<img width="761" alt="2_vault" src="https://user-images.githubusercontent.com/71979171/226241119-d00e7c2a-ae7a-49a2-8c21-06554dfc2808.PNG">

## Pipeline -

Now in ADF Studio, I created Linked Service for S3 (using key vault secrets) and another for ADLS connected to storage with landing folder on Azure (& tested connections to make sure they work well)

Then I proceed to create a new "S3_to_ADLS_Ingestion" Pipeline and add to it a **Copy activity**.
**Pipeline Source**  = S3 Linked Service 
(For the directory path, I parameterized the path by adding dynamic content to pick data for each day from its folder, using @concat command and the formatDateTime function)
**Pipeline Sink**  = ADLS Landing folder 
(Again to put each day's data in its respective date folder, I used @concat & the formatDateTime function)

<img width="955" alt="Pipeline_successful" src="https://user-images.githubusercontent.com/71979171/226243106-c00914b1-53c3-46cb-b276-b6601f77222e.PNG">

The data is then successfully copied from S3 to our landing folder in ADLS.

<img width="937" alt="Pipeline_successful_2" src="https://user-images.githubusercontent.com/71979171/226243423-7bba0898-95c1-4d63-9da2-cfde96d9e513.PNG">


## File Validation using Azure Function App & Blob Trigger Functions

A trigger should be activated as soon as a file lands in the ADLS landing folder. For this I have used a Blob Trigger function that uses a JavaScript coded function to detect any new file in the landing folder and based on that executes the script. The script validates the file and accordingly sends it to either a **staging folder** or a **rejected folder** for invalid files. The trigger-function pipeline looks like this -

<img width="763" alt="BlobTrigger" src="https://user-images.githubusercontent.com/71979171/226456898-2faad1ea-876e-424f-acdf-5f09d2e8b735.PNG">

Testing a valid file & running the script gives the following output - 

<img width="938" alt="Func_1" src="https://user-images.githubusercontent.com/71979171/226457028-84b006b8-5dcc-472e-9508-52b293f39ebe.PNG">

Subsequently, a staging folder is created in the input directory (since the file was valid) 

<img width="431" alt="staging_created" src="https://user-images.githubusercontent.com/71979171/226457624-7dac60bc-020a-4e66-a11f-54a2f1dd069c.PNG">


## Creating Azure SQL Server & Database (another ADF Pipeline)

Now, the validated files need to be transferred from the staging folder to a SQL DB. For this, I will be using Azure Data Factory again.
This time the pipeline source will be the staging folder in our input directory & sink a SQL database. In the pipeline itself, a trigger will need to be created that gets activated whenever a file appears in the staging folder. After linking the pipeline source & sink, upon publishing & triggering the staging event, the pipeline successfully transfers the data from ADLS staging folder to Azure SQL Database -

<img width="861" alt="Staging_sql_db" src="https://user-images.githubusercontent.com/71979171/226479459-2cef2fa4-6069-4801-a40b-d932907549f2.PNG">

It says 500 rows have been written to a table in our SQL Db. We can verify that using the db query editor - 

<img width="927" alt="Query" src="https://user-images.githubusercontent.com/71979171/226481334-16010099-d848-4f43-91e0-e5a00931870f.PNG">


Hence, an end-to-end pipeline is successfully deployed that will continuously pick up data from a source AWS S3 bucket, bring it to Azure using an ADF Pipeline, validate the files and finally, using another ADF pipeline, store it into an Azure SQL Storage Database.
