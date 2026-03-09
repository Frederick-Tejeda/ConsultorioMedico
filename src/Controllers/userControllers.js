const { decode } = require('jsonwebtoken');
const User = require('../Models/userModel')
const { Encrypt, Decrypt } = require('../crypt');
const { sign } = require('../jwt');

const controller = {}

controller.getUsers = async (req, res) => {
    const users = await User.find()
    res.status(200).json(users)
}

controller.authUser = async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) return res.status(500).json({"message": 'Something went wrong...', "success": false});
    const user = await User.findOne({ username });
    if(!user) return res.status(200).json({"message": 'User no exist...', "success": false});
    const decryptedPassword = Decrypt(user.password);
    if(decryptedPassword[0] == "ERR") return res.status(500).json({"message": decryptedPassword[1], "success": false});
    if(decryptedPassword[1] !== password) return res.status(200).json({"message": 'Wrong password...', success: false});
    sign({ id: user._id }).then( ([status, token]) => {
        if(!status) return res.status(500).json({"message": token, "success": false});
        return res.status(200).json({"idUser": user._id, "token": token, "success": true});
    });
}

controller.createUser = async (req, res) => {
    const { username, password } = req.body
    const userFound = await User.findOne({ username })
    if(userFound) return res.status(200).json({ "message": "User all ready exist", "success": false})
    const encryptedPassword = Encrypt(password);
    if(encryptedPassword[0] == "ERR") return res.status(500).json({ "message": encryptedPassword[1], "success": false});
    const newUser = new User({ username, password: encryptedPassword[1] })
    await newUser.save()
    res.status(201).json({ "message": 'User created', "success": true })
}

controller.getUser = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(!user) return res.status(200).json({"message": 'User no exist...', "success": false});
    const decryptedPassword = Decrypt(user.password);
    if(decryptedPassword[0] == "ERR") return res.status(500).json({"message": decryptedPassword[1], "success": false});
    user.password = decryptedPassword[1];
    res.status(200).json({user, "success": true})
}

controller.updateUser = async (req, res) => {
    const actualUser = await User.findById(req.params.idUser)
    if(actualUser == null){
        res.status(500).json({"message": 'Something went wrong while updating...', "success": false})
    }
    else{
        const newUserData = req.body;
        const encryptedUserData = Encrypt(newUserData.password);
        if(encryptedUserData[0] == "ERR") return res.status(500).json({"message": encryptedUserData[1], "success": false});
        newUserData.password = encryptedUserData[1];
        await User.findByIdAndUpdate(req.params.idUser, newUserData)
        res.status(200).json({ "message": 'User updated', "success": true })
    }
}

controller.deleteUser = async (req, res) => {
    const actualUsers = await User.find()
    await User.findByIdAndDelete(req.params.idUser)
    const newActualUsers = await User.find()
    if(actualUsers.length == newActualUsers.length){
        res.status(500).json({"message": 'Something went wrong while deleting...', "success": false})
    }else{
        res.status(200).json({"message": 'User deleted', "success": true})
    }
}

controller.getProfile = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(user == null){
        res.status(500).json({"message": 'User no exist...'});
    }else{
        const profile = user.profiles.find(profile => profile._id.toString() === req.params.idProfile);
        if(profile) return res.status(200).json(profile);
        else return res.status(500).json({"message": 'Profile no exist...'});
    }
}

controller.updateProfile = async (req, res) => {
    const user = await User.findById(req.params.idUser)
    if(user == null){
        return res.status(500).json({"message": 'User no exist...', "success": false});
    }else{
        const { username, password } = user;
        const profile = user.profiles.find(profile => profile._id.toString() === req.params.idProfile);
        if(!profile) return res.status(500).json({"message": 'Profile no exist...', "success": false});

        const { avatar, name, code, isKid, watchingTvShows, watchingMovies, wishList, favorites } = profile;
        const [newWatchingMovies = watchingMovies, newWatchingTvShows = watchingTvShows, newWishList = wishList, newFavorites = favorites] = [ [...watchingMovies], [...watchingTvShows], [...wishList], [...favorites] ];
        const { change, id } = req.query;
        
        if(!change || !id) return res.status(500).json({"message": 'Something went wrong...', "success": false});

        if(change == "movie"){
            const allreadyWatchingIt = (newWatchingMovies.findIndex( movie => movie.id === id ) == -1) ? false : true;
            if(!allreadyWatchingIt) newWatchingMovies.push( { id } );
        }else if(change == "tv"){
            const season = req.query.season || 1;
            const episode = req.query.episode || 1;
        
            if(!season || !episode) return res.status(500).json({"message": 'Something went wrong...', "success": false});

            const watchingItIndex = newWatchingTvShows.findIndex( tvShow => tvShow.id === id );
            if(watchingItIndex != -1){
                newWatchingTvShows[watchingItIndex].progress.season = season;
                newWatchingTvShows[watchingItIndex].progress.episode = episode;
            }else{
                newWatchingTvShows.push( { id: id, progress: { season, episode } } );
            }
        }else if(change == "WishList"){
            const allreadyWishItem = (newWishList.findIndex( item => item.id === id ) == -1) ? false : true;
            if(!allreadyWishItem) newWishList.push( { id } );
        }else if(change == "Favorites"){
            const allreadyFavorite = (newFavorites.find( favorite => favorite.id === id ) == -1)? true : false;
            if(!allreadyFavorite) newFavorites.push( { id } );
        }else{
            return res.status(500).json({"message": 'Something went wrong...', "success": false});
        }

        const updatePayload = {
            $set: {
                username: username, 
                password: password,
                'profiles.$.avatar': avatar,
                'profiles.$.name': name,
                'profiles.$.code': code,
                'profiles.$.isKid': isKid,
                'profiles.$.watchingTvShows': newWatchingTvShows,
                'profiles.$.watchingMovies': newWatchingMovies,
                'profiles.$.favorites': newFavorites,
                'profiles.$.wishList': newWishList
            },
        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.idUser, 'profiles._id': req.params.idProfile },
            updatePayload,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User or Profile not found." });
        }

        updatedUser.password = undefined;

        res.status(200).json({ 
            message: `Profile '${name}' updated successfully.`,
            user: updatedUser 
        });
    }
}

module.exports = controller