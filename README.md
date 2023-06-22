# Mongoose Query Builder

The Mongoose Query Builder is a powerful library designed to simplify the construction of MongoDB queries using Mongoose. It provides a convenient and intuitive way to generate complex queries without the need for manual query building.

With the Mongoose Query Builder, you can easily define query fields and their corresponding patterns, such as exact match, list values, date range, and search. By registering these query fields, you gain the ability to generate MongoDB queries effortlessly based on user input or predefined criteria.

## Key Features

- **Simplified Query Construction**: Constructing complex MongoDB queries becomes straightforward and intuitive with the Query Builder's easy-to-use API.
- **Pattern-Based Query Generation**: Define patterns for different types of queries, including exact match, list values, date range, and search, allowing for flexible and dynamic query generation.
- **Customizable and Extensible**: The Query Builder is highly customizable, enabling you to define and register your own query patterns and generators.
- **Seamless Integration with Mongoose**: Utilize the generated queries seamlessly with Mongoose models, making it a perfect fit for Mongoose-based projects.
- **Examples and Usage Guide**: The library comes with a comprehensive set of examples and a usage guide to help you get started quickly.

## Documentation

## Installation
First install [Node.js](http://nodejs.org/) and [MongoDB](https://www.mongodb.org/downloads). Then:

```sh
$ npm i mongoose-query-build
```

## Example

#### NOTE: 
1. The default for value in query parameter splitting is `comma` to accommodate multiple clause usage but in case of search, you might want to split by "space" and "comma" etc, the "comma" usage is important to find multiple items at a time by providing the value separated by comma.

2. Always log the register output to know what query parameter field u can define for your APIs per model you defined.

### Simple Case 1

```ts
     import mongoose from 'mongoose';
     import MongooseQueryBuilder from 'mongoose-query-build';
     import { BuildFieldType, BuildPattern } from 'mongoose-query-build/utils';
     
     const { Schema } = mongoose;
     const blogSchema = new Schema({
       title: String,
       author: String,
       comments: [{ body: String, date: Date }],
     });
    const Blog = mongoose.model('Blog', blogSchema);


 
 // Schema definition for query register

   // This returns array of generated query parameters to use. 
   // You can assign to see the query names.
    MongooseQueryBuilder.register({
     model: 'blog',
     fields: [
      {
        name: 'title',
        type: BuildFieldType.STRING,
        patterns: [BuildPattern.SEARCH],
     },
     {
        name: 'author',
        type: BuildFieldType.STRING,
        patterns: [BuildPattern.SEARCH],
     },
     {
        name: 'comments.body',
        type: BuildFieldType.STRING,
        patterns: [BuildPattern.SEARCH],
     },   
     {
        name: 'comments.date',
        type: BuildFieldType.DATE,
        patterns: [BuildPattern.DATE_RANGE],
     },     
     ]
    })

  // Service usage 
  async findAll(req) {
    // sample URL looks like https://exampe.com/api/v1/blogs?blog_title=The Begining,Age of war&blog_author=Fola&blog_comments_body=news&blog_comments_date=2023-09-09,2023-09-10
    const result = MongooseQueryBuilder.generate(req.query);
    return Blog.find(result.dbQuery);
  }

```

### Simple Case 2

Using Exact with boolean, objectId, number, String, date

```ts
 const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'business',
            type: BuildFieldType.OBJECT_ID,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'status',
            type: BuildFieldType.BOOLEAN,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          
          {
            name: 'amount',
            type: BuildFieldType.NUMBER,
            patterns: [BuildPattern.EXACT_LIST],
          },
        ],
      });
      
```

### Sample case 3

Using mix of Exact and Search with boolean, objectId, number, String, date

```ts
 const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'business',
            type: BuildFieldType.OBJECT_ID,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'status',
            type: BuildFieldType.BOOLEAN,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST, BuildPattern.SEARCH],
          },
          
          {
            name: 'amount',
            type: BuildFieldType.NUMBER,
            patterns: [BuildPattern.EXACT_LIST, BuildPattern.SEARCH],
          },
        ],
      });
```

## Other Notice

Please check the repository for sample test case to support your usage in code.

Thanks!!!
