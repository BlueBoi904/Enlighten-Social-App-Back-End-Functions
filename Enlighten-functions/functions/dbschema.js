let db = {
    users: [
            {
                userId: '',
                email: 'user@gmail.com',
                handle: 'user',
                createdAt: new Date().toISOString(),
                imageUrl: 'image.dfdfskfkjfksjf',
                bio: 'Hello my name is Frank',
                website: 'https://user.com',
                location: 'Jacksonville, FL'
            }

    ],

    whispers: [
        {
            userHandle: 'user',
            body: 'this is the whisper body',
            createdAt: "2019-06-29T20:27:43.058Z",
            //new Date().toISOString();
            likeCount: 5,
            commentCount: 2
        }
    ],

};
const userDetails = {
    // Redux data
    credentials: {
      userId: 'N43KJ5H43KJHREW4J5H3JWMERHB',
      email: 'user@email.com',
      handle: 'user',
      createdAt: '2019-03-15T10:59:52.798Z',
      imageUrl: 'image/dsfsdkfghskdfgs/dgfdhfgdh',
      bio: 'Hello, my name is user, nice to meet you',
      website: 'https://user.com',
      location: 'Lonodn, UK'
    },
    likes: [
      {
        userHandle: 'user',
        screamId: 'hh7O5oWfWucVzGbHH2pa'
      },
      {
        userHandle: 'user',
        screamId: '3IOnFoQexRcofs5OhBXO'
      }
    ]
  };