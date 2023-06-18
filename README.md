# Mongoose Query Builder

This mongoose query builder for application filter, search, match and whatever simple to complex filter needed on a model defined

## Example

NOTE: The default for value in query parameter splitting is `comma` to accommodate multiple clause usage but in case of search, you might want to split by "space" and "comma" etc, the "comma" usage is important to find multiple items at a time by providing the value separated by comma

### Simple Case 1

```$
     import mongoose from 'mongoose';
     import MongooseQueryBuilder from 'mongoose-query-builder';
     const { Schema } = mongoose;
     const blogSchema = new Schema({
       title: String,
       author: String,
       comments: [{ body: String, date: Date }],
     });
    const Blog = mongoose.model('Blog', blogSchema);

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

  async findAll(req) {
    // sample URL looks like https://exampe.com/api/v1/blogs?blog_title=The Begining,Age of war&blog_author=Fola&blog_comments_body=news&blog_comments_date=2023-09-09,2023-09-10
    const result = MongooseQueryBuilder.generate(req.query);
    return Blog.find(result.dbQuery);
  }

```

### Simple Case 2

Using Exact with boolean, objectId, number, String, date

```$xslt
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

```$xslt
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
