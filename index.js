import bodyParser from 'body-parser';
import express from 'express'
import pg from 'pg'

const db = new pg.Client({
    host:'localhost', 
    user:'postgres',
    database:'bookLibrary',
    password:'Ansh123@',
    port:5432
})

db.connect();

let books=[];

const port = 3000;
const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',async (req,res)=>{
    var result = await db.query('select * from books');
    res.render("index.ejs",{books:result.rows});
})

app.get('/newBook',(req,res)=>{
    res.render("newBook.ejs");
})

app.get('/bookNotes', async (req,res)=>{
    var result = await db.query('select * from notes where book_id = $1',[req.query.id]);
    var allnotes = result.rows;
    result= await db.query('select * from books where id = $1',[req.query.id]);
    var bookDetails = result.rows[0]; 
    res.render('bookNotes.ejs',{
        id:req.query.id , 
        notes : allnotes , 
        details: bookDetails
    });
})

app.get('/deleteBook',(req,res)=>{
    let curname=req.query.name;
    for(var i=0;i<books.length;++i)
    {
        if(curname==books[i].name)
        {
            books.splice(i,1);
        }
    }
    res.redirect('/');
})

app.post('/createNote',async (req,res)=>{
    await db.query('insert into notes (note_description,book_id) values ($1,$2)',[req.body.noteBody,req.body.bookId]);
    res.redirect(`/bookNotes?id=${req.body.bookId}`);
})

app.post('/createNewBook', async (req,res)=>{
    await db.query('insert into books (book_name, book_author, book_description, genre, book_rating, image_code) values ($1,$2,$3,$4,$5,$6)',[req.body.name,req.body.author,req.body.description,req.body.genre,req.body.rating,req.body.image])
    res.redirect('/');
})

app.listen(port);
console.log(`Listening at port ${port}`);

