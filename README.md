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

