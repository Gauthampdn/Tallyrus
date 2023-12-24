const { default: mongoose } = require("mongoose")
const Template = require("../models/templateModel")

// get all templates

const getTemplates = async (req, res) => {  // DONE

  const user_id = req.user.id

  const templates = await Template.find({user_id}).sort({updatedAt: -1})

  res.status(200).json(templates)
}


// get a single template

const getTemplate = async (req, res) => {

  const {id} = req.params

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({error: "No such Template and invalid ID"})
  }

  const template = await Template.findById(id)

  if(!template){
    return res.status(404).json({error: "No such Template"})
  }
  
  res.status(200).json(template)
}


// create a new template

const createTemplate = async (req, res) => {
  const { title, description, image, icon, template } = req.body;

  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!template || template.length === 0) {
    emptyFields.push("template");
  }

  if (emptyFields.length > 0) {
    return res.status(400).json({ error: "Please fill in all fields", emptyFields });
  }

  // Adding document to DB
  try {
    const user_id = req.user.id;
    const newTemplate = await Template.create({
      title,
      description,
      image,
      icon,
      template,
      convos: [],
      user_id,
      public: false
    });

    res.status(200).json(newTemplate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



// delete a template
const deleteTemplate = async (req, res) => {

  const {id} = req.params

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({error: "No such Template and invalid ID"})
  }

  const template = await Template.findByIdAndDelete(id)

  if(!template){
    return res.status(404).json({error: "No such Template"})
  }

  res.status(200).json(template)

}


const updateTemplate = async (req, res) => {
  const {id} = req.params;

  if(!mongoose.Types.ObjectId.isValid(id)){
    return res.status(404).json({error: "No such Template and invalid ID"});
  }

  const existingTemplate = await Template.findById(id);
  if(!existingTemplate){
    return res.status(404).json({error: "No such Template"});
  }

  const updatedTemplateData = {
    ...req.body
  };

  const updatedTemplate = await Template.findByIdAndUpdate(id, updatedTemplateData, { new: true });

  res.status(200).json(updatedTemplate);
};


// get all public templates
const getPublicTemplates = async (req, res) => {
  try {
    const publicTemplates = await Template.aggregate([
      { $match: { public: true } }, // Match documents where public is true
      { $project: { // Define how the output documents should be projected
        title: 1, 
        description: 1, 
        updatedAt: 1,
        image: 1,
        icon: 1,
        _id: 0,
        template: {
          $map: { // Transform each element of the 'template' array
            input: "$template",
            as: "t",
            in: { // Define the structure of the transformed elements
              type: "$$t.type",
              context: "$$t.context"
              // Not including _id will exclude it
            }
          }
        }
      }}
    ]).sort({ updatedAt: -1 }); // Sort the results by updatedAt in descending order

    res.status(200).json(publicTemplates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};




module.exports = {
  getTemplate,
  getTemplates,
  createTemplate,
  deleteTemplate,
  updateTemplate,
  getPublicTemplates
}