class Features {  //addng features to the query
    constructor(query, queryStr) {        //query is the query object and queryStr is the query string 
        this.query = query;   // is ko keh skta hain k base function kya call ho rha mongoose sa   
        // hm krta tha mongodbobject.find({name: 'apple'});  toh yeh query hai
        this.queryStr = queryStr;       // 
    }

    search() {                                                                // jb search karin ga tou ky ahoo ga function hai jo chalna 
        const keyword = this.queryStr.keyword ? {        // agr koi keyword milta hai tou uss keyword kki value uthae ga aur i option mtlb case sensitive nhi hoga
            name: {                                                          // simple jis ka name keyword ka sath attach oo ga wo yahan aa jae ga 
                $regex: this.queryStr.keyword,                 // $regex is a mongodb operator which is used to find the matching string
                $options: 'i'                                                // mtlb ka samosa ho ya samosasauce 
            }
        } : {}

        this.query = this.query.find({ ...keyword });

        return this;
    }




    filter() {
        const Newquery = { ...this.queryStr };
        let removalList = ["keyword", "limit", "page"];       // yeh keyword, limit, page ko remove krna ka lia hai
        removalList.forEach(key => {
            delete Newquery[key];           // yeh keyword, limit, page ko remove krna ka lia hai
        });

        if (Newquery.category == '') {
            delete Newquery.category;   // agr category empty hai tou remove kr da ga
        }



        // aik aur cheez hai jo filter krna hai wo hai filter by price lekin uss ka lia kaam ata hain mongoose   opaerators 
        //  ab jo operator hon ga url ma uss ka lia kuch aur hoga jaisa -------lt    gt     lte    gte     ko convert krna hoga $lt    $gt    $lte    $gte     tou uss ka lia object ko editable bnaana hoga
        //  tou uss ka lia yeh kaam kara ga

        let queryNew = JSON.stringify(Newquery);                                                                        // object ko string mai convert krna ka lia hai
        queryNew = queryNew.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);               // yeh regex hai jo match kara ga gt, gte, lt, lte ko aur uss ka lia $ add kr da ga
        // /\b(lt | lte | gt | gte)\b/g                        its regular expression in js to find match in string     $regex is mongoose property to find the matching string      so can't be used here 


        // ab sirf category bach gai hai query mai uss ki base pr search kr dein ga
        // kaam khatam itna hi kaam tha 

        this.query = this.query.find(JSON.parse(queryNew));     // ab jo string hai uss ko object mai convert krna ka lia hai
        return this;       // return krna ka lia hai ta ka chain mai chalta jae 
    }

    pagination(pageNumber) {
        const currentPage = Number(this.queryStr.page) || 1;   // agr koi page number nhi milta tou 1 set kr da ga
        const perPageProducts = pageNumber;   //  products per page

        const skipProducts = perPageProducts * (currentPage - 1);   // agr page 1 hai tou 0 products skip kara ga agr page 2 hai tou 4 products skip kara ga
        this.query = this.query.limit(perPageProducts).skip(skipProducts);   // limit and skip are mongoose functions to limit the products and skip the products
        return this;
    }




}





module.exports = Features;