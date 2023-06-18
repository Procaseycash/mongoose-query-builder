import { Types } from 'mongoose';
import * as dateFns from 'date-fns';
import { MongooseQueryBuilder } from './index';
import { BuildFieldType, BuildPattern } from './utils';
import expect from 'expect';

describe('MongooseQueryBuilder', () => {
  describe('When using Builder Pattern EXACT_LIST', () => {
    it('Query Fields with simple field names', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'createdAt',
            type: BuildFieldType.DATE,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'paymentDate',
            type: BuildFieldType.DATE,
            patterns: [BuildPattern.DATE_RANGE],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate({
        user_firstName: 'fola',
        user_email: 'fola@gmail.com',
        user_createdAt: '2023-08-09',
        user_paymentDate_date_range: '2023-08-09,2023-08-09',
      });

      expect(queryFields).toEqual([
        'user_firstName',
        'user_lastName',
        'user_email',
        'user_createdAt',
        'user_paymentDate_date_range',
      ]);
      expect(result.dbQueryFields).toEqual([
        'user_firstName',
        'user_email',
        'user_createdAt',
        'user_paymentDate_date_range',
      ]);

      const startDate = dateFns.startOfDay(new Date('2023-08-09'));
      const endDate = dateFns.endOfDay(new Date('2023-08-09'));

      expect(result.dbQuery).toEqual({
        $and: [
          { firstName: { $in: ['fola'] } },
          { email: { $in: ['fola@gmail.com'] } },
          { createdAt: { $lte: new Date('2023-08-09') } },
          { paymentDate: { $gte: startDate, $lte: endDate } },
        ],
      });
    });

    it('Query Fields with simple field names using registerList', () => {
      // You can define multiple model types, this is just an example of not doing per model
      const queryFields = MongooseQueryBuilder.registerList([
        {
          model: 'user',
          fields: [
            {
              name: 'firstName',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.EXACT_LIST],
            },
            {
              name: 'lastName',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.EXACT_LIST],
            },
            {
              name: 'email',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.EXACT_LIST],
            },
          ],
        },
      ]);

      const result = MongooseQueryBuilder.generate({
        user_firstName: 'fola',
        user_email: 'fola@gmail.com',
      });

      expect(queryFields).toEqual([
        'user_firstName',
        'user_lastName',
        'user_email',
      ]);
      expect(result.dbQueryFields).toEqual(['user_firstName', 'user_email']);
      expect(result.dbQuery).toEqual({
        $and: [
          { firstName: { $in: ['fola'] } },
          { email: { $in: ['fola@gmail.com'] } },
        ],
      });
    });

    it('Query Fields with simple field names but multiple values', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'status',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate({
        user_firstName: 'fola,segun',
        user_status: 'paid,failed',
        user_email: 'fola@gmail.com,bola@gmail.com',
      });

      expect(queryFields).toEqual([
        'user_firstName',
        'user_status',
        'user_email',
      ]);
      expect(result.dbQueryFields).toEqual([
        'user_firstName',
        'user_status',
        'user_email',
      ]);
      expect(result.dbQuery).toEqual({
        $and: [
          { firstName: { $in: ['fola', 'segun'] } },
          { status: { $in: ['paid', 'failed'] } },
          { email: { $in: ['fola@gmail.com', 'bola@gmail.com'] } },
        ],
      });
    });

    it('Query Fields with simple boolean and objectId type but multiple values', () => {
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
        ],
      });

      const result = MongooseQueryBuilder.generate({
        user_business: '6471104cc17ea387218a736f,6471104cc17ea387218a736d',
        user_status: '1',
        user_email: 'fola@gmail.com,bola@gmail.com',
      });

      expect(queryFields).toEqual([
        'user_business',
        'user_status',
        'user_email',
      ]);
      expect(result.dbQueryFields).toEqual([
        'user_business',
        'user_status',
        'user_email',
      ]);
      expect(result.dbQuery).toEqual({
        $and: [
          {
            business: {
              $in: [
                new Types.ObjectId('6471104cc17ea387218a736f'),
                new Types.ObjectId('6471104cc17ea387218a736d'),
              ],
            },
          },
          { status: true },
          { email: { $in: ['fola@gmail.com', 'bola@gmail.com'] } },
        ],
      });
    });

    it('Query Fields with simple field names with dotted notation', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'friend.firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'friend.lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
          {
            name: 'friend.email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate({
        user_friend_firstName: 'fola',
        user_friend_email: 'fola@gmail.com',
      });

      expect(queryFields).toEqual([
        'user_friend_firstName',
        'user_friend_lastName',
        'user_friend_email',
      ]);
      expect(result.dbQueryFields).toEqual([
        'user_friend_firstName',
        'user_friend_email',
      ]);
      expect(result.dbQuery).toEqual({
        $and: [
          { 'friend.firstName': { $in: ['fola'] } },
          { 'friend.email': { $in: ['fola@gmail.com'] } },
        ],
      });
    });
  });

  describe('When using Builder Pattern SEARCH', () => {
    it('Query Fields with simple field names', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'amount',
            type: BuildFieldType.NUMBER,
            patterns: [BuildPattern.SEARCH],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate(
        {
          user_search: 'fola fola@gmail.com 200',
        },
        ',\\s',
      );

      expect(queryFields).toEqual(['user_search']);
      expect(result.dbQueryFields).toEqual(['user_search']);
      expect(result.dbQuery).toEqual({
        $and: [
          {
            $or: [
              { firstName: { $regex: 'fola', $options: 'i' } },
              { firstName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { firstName: { $regex: '200', $options: 'i' } },
              { lastName: { $regex: 'fola', $options: 'i' } },
              { lastName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { lastName: { $regex: '200', $options: 'i' } },
              { email: { $regex: 'fola', $options: 'i' } },
              { email: { $regex: 'fola@gmail.com', $options: 'i' } },
              { email: { $regex: '200', $options: 'i' } },
              { amount: 200 },
            ],
          },
        ],
      });
    });
    it('Query Fields with simple field names using registerList Option', () => {
      // You can define multiple model types, this is just an example of not doing per model
      const queryFields = MongooseQueryBuilder.registerList([
        {
          model: 'user',
          fields: [
            {
              name: 'firstName',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.SEARCH],
            },
            {
              name: 'lastName',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.SEARCH],
            },
            {
              name: 'email',
              type: BuildFieldType.STRING,
              patterns: [BuildPattern.SEARCH],
            },
            {
              name: 'amount',
              type: BuildFieldType.NUMBER,
              patterns: [BuildPattern.SEARCH],
            },
          ],
        },
      ]);

      const result = MongooseQueryBuilder.generate(
        {
          user_search: 'fola fola@gmail.com 200',
        },
        ',\\s',
      );

      expect(queryFields).toEqual(['user_search']);
      expect(result.dbQueryFields).toEqual(['user_search']);
      expect(result.dbQuery).toEqual({
        $and: [
          {
            $or: [
              { firstName: { $regex: 'fola', $options: 'i' } },
              { firstName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { firstName: { $regex: '200', $options: 'i' } },
              { lastName: { $regex: 'fola', $options: 'i' } },
              { lastName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { lastName: { $regex: '200', $options: 'i' } },
              { email: { $regex: 'fola', $options: 'i' } },
              { email: { $regex: 'fola@gmail.com', $options: 'i' } },
              { email: { $regex: '200', $options: 'i' } },
              { amount: 200 },
            ],
          },
        ],
      });
    });
    it('Query Fields with dot notation field names', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'friend.firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'amount',
            type: BuildFieldType.NUMBER,
            patterns: [BuildPattern.SEARCH],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate(
        {
          user_search: 'fola fola@gmail.com 200',
        },
        ',\\s',
      );

      expect(queryFields).toEqual(['user_search']);
      expect(result.dbQueryFields).toEqual(['user_search']);
      expect(result.dbQuery).toEqual({
        $and: [
          {
            $or: [
              { 'friend.firstName': { $regex: 'fola', $options: 'i' } },
              {
                'friend.firstName': { $regex: 'fola@gmail.com', $options: 'i' },
              },
              { 'friend.firstName': { $regex: '200', $options: 'i' } },
              { lastName: { $regex: 'fola', $options: 'i' } },
              { lastName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { lastName: { $regex: '200', $options: 'i' } },
              { email: { $regex: 'fola', $options: 'i' } },
              { email: { $regex: 'fola@gmail.com', $options: 'i' } },
              { email: { $regex: '200', $options: 'i' } },
              { amount: 200 },
            ],
          },
        ],
      });
    });
    it('Query Fields with objectId and boolean: expect search to skip status and friend fields in query built', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'friend.firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'email',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'amount',
            type: BuildFieldType.NUMBER,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'status',
            type: BuildFieldType.BOOLEAN,
            patterns: [BuildPattern.SEARCH],
          },
          {
            name: 'friend',
            type: BuildFieldType.OBJECT_ID,
            patterns: [BuildPattern.SEARCH],
          },
        ],
      });

      const result = MongooseQueryBuilder.generate(
        {
          user_search: 'fola fola@gmail.com 200',
        },
        ',\\s',
      );

      expect(queryFields).toEqual(['user_search']);
      expect(result.dbQueryFields).toEqual(['user_search']);
      expect(result.dbQuery).toEqual({
        $and: [
          {
            $or: [
              { 'friend.firstName': { $regex: 'fola', $options: 'i' } },
              {
                'friend.firstName': { $regex: 'fola@gmail.com', $options: 'i' },
              },
              { 'friend.firstName': { $regex: '200', $options: 'i' } },
              { lastName: { $regex: 'fola', $options: 'i' } },
              { lastName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { lastName: { $regex: '200', $options: 'i' } },
              { email: { $regex: 'fola', $options: 'i' } },
              { email: { $regex: 'fola@gmail.com', $options: 'i' } },
              { email: { $regex: '200', $options: 'i' } },
              { amount: 200 },
            ],
          },
        ],
      });
    });
  });

  describe('When using Builder Pattern EXACT_LIST and SEARCH mixed together', () => {
    it('Query Fields with simple field names', () => {
      const queryFields = MongooseQueryBuilder.register({
        model: 'user',
        fields: [
          {
            name: 'firstName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST, BuildPattern.SEARCH],
          },
          {
            name: 'lastName',
            type: BuildFieldType.STRING,
            patterns: [BuildPattern.EXACT_LIST, BuildPattern.SEARCH],
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

      const result = MongooseQueryBuilder.generate(
        {
          user_firstName: 'fola',
          user_email: 'fola@gmail.com',
          user_search: 'fola fola@gmail.com 200',
        },
        ',\\s',
      );

      expect(queryFields).toEqual([
        'user_firstName',
        'user_lastName',
        'user_email',
        'user_amount',
        'user_search',
      ]);
      expect(result.dbQueryFields).toEqual([
        'user_firstName',
        'user_email',
        'user_search',
      ]);
      expect(result.dbQuery).toEqual({
        $and: [
          { firstName: { $in: ['fola'] } },
          { email: { $in: ['fola@gmail.com'] } },
          {
            $or: [
              { firstName: { $regex: 'fola', $options: 'i' } },
              { firstName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { firstName: { $regex: '200', $options: 'i' } },
              { lastName: { $regex: 'fola', $options: 'i' } },
              { lastName: { $regex: 'fola@gmail.com', $options: 'i' } },
              { lastName: { $regex: '200', $options: 'i' } },
              { email: { $regex: 'fola', $options: 'i' } },
              { email: { $regex: 'fola@gmail.com', $options: 'i' } },
              { email: { $regex: '200', $options: 'i' } },
              { amount: 200 },
            ],
          },
        ],
      });
    });
  });
});
