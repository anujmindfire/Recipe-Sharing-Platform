import axios from 'axios';

export const getState = async (req, res) => {
    try {
        const response = await axios.get('https://cdn-api.co-vin.in/api/v2/admin/location/states');
        res.json(response.data);
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};

export const getCity = async (req, res) => {
    const { stateId } = req.params;
    try {
        const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/admin/location/districts/${stateId}`);
        res.json(response.data);
    } catch (error) {
        return res.status(400).send({ status: false, message: constant.general.genericError });
    }
};