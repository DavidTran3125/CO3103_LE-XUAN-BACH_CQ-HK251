const {connectDB,sql}= require('../config/db')

exports.get_profile = async (id)=>{
    try {
        const pool = await connectDB();
        const stringsql = `
            select User_ID, Username ,Bio
            from User_Profile u 
            where u.User_ID = @id`
        const result= await pool.request()
            .input('id',sql.Int,id)
            .query(stringsql);
        return result.recordset[0] || null;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.get_strengths =async (id)=>{
    try {
        const pool = await connectDB();
        const stringsql = `
            select Strength 
            from Profile_Strength p 
            where P.User_ID = @id`
        const result= await pool.request()
            .input('id',sql.Int,id)
            .query(stringsql);
        return result.recordset ;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.get_weakness =async (id)=>{
    try {
        const pool = await connectDB();
        const stringsql = `
            select Weakness 
            from Profile_Weakness p 
            where P.User_ID = @id`
        const result= await pool.request()
            .input('id',sql.Int,id)
            .query(stringsql);
        return result.recordset ;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.update_profile_DB =async (id,bio=null)=>{
    try {
        const pool = await connectDB();
        const stringsql = `
            update u
            set
                u.Bio=@bio
            from User_Profile u
            where u.User_ID=@id`
        await pool.request()
            .input('id',sql.Int,id)
            .input('bio',sql.NVarChar,bio)
            .query(stringsql);
        return ;
    } catch (err) {
        console.log(err);
        throw err;
    }
}

exports.add_strength_DB =async (id,strengths=[])=>{
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        

        await transaction.begin();
        // const request = new sql.Request(transaction);

        const stringsql = `
            insert into Profile_Strength(User_ID,Strength)
            values (@id,@strength)`
        for( const strength of strengths){
            const request = new sql.Request(transaction);
            await request
                .input('id',sql.Int,id)
                .input('strength',sql.NVarChar,strength)
                .query(stringsql);
        }
        await transaction.commit();
        return  ;
    } catch (err) {
        await transaction.rollback();
        console.log(err);
        throw err;
    }
}

exports.add_weakness_DB =async (id,weaknesses=[])=>{
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);
    try {
        
        await transaction.begin();
        // const request = new sql.Request(transaction);

        const stringsql = `
            insert into Profile_Weakness(User_ID,Weakness)
            values (@id,@weakness)`
        for( const weakness of weaknesses){
            const request = new sql.Request(transaction);
            await request
                .input('id',sql.Int,id)
                .input('weakness',sql.NVarChar,weakness)
                .query(stringsql);
        }
        await transaction.commit();
        return  ;
    } catch (err) {
        await transaction.rollback();
        console.log(err);
        throw err;
    }
}