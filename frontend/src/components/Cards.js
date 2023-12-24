
const Cards = ({ projects }) => {
  return (
      <div className="grid-container">
          {projects.map((project, index) => (
              <div
                  key={index}
                  className={`card ${project.gridClass} ${project.textPosition === 'top-left' ? 'card-top-left' : project.textPosition === 'bottom-left' ? 'card-bottom-left' : project.textPosition === 'center-middle' ? 'card-center-middle' : ''} ${project.backgroundColor || ''} ${project.theme}-theme`}
                  style={project.backgroundImage ? { backgroundImage: `url(${project.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
              >

                  {project.badges && (
                      <div className="badges">
                          {project.badges.map((badge, badgeIndex) => (
                              <span key={badgeIndex} className="badge">{badge}</span>
                          ))}
                      </div>
                  )}

                  {project.title && <h3>{project.title}</h3>}
                  {project.subtitle && <h4>{project.subtitle}</h4>}
                  {project.description && <p>{project.description}</p>}

                  {/* Conditional rendering of the link button */}
                  {project.link && (
                      <button className="button-link" onClick={() => window.open(project.link, '_blank')}>
                          {project.linknote} ↗
                      </button>
                  )}

                  {/* Conditional rendering of the download button */}
                  {project.downloadPath && (
                      <a className="button-link" href={project.downloadPath} download>
                          Download
                      </a>
                  )}

                  {project.socialLinks && (
                      <div className="social-icons">
                          {project.socialLinks.linkedin && (
                              <a href={project.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                                  <i className="fa fa-linkedin"></i>
                              </a>
                          )}
                          {project.socialLinks.github && (
                              <a href={project.socialLinks.github} target="_blank" rel="noopener noreferrer">
                                  <i className="fa fa-github"></i>
                              </a>
                          )}
                          {project.socialLinks.website && (
                              <a href={project.socialLinks.website} download>
                                  <i className="fa fa-file"></i>
                              </a>
                          )}



                      </div>
                  )}


              </div>
          ))}
      </div>
  );
};

 
export default Cards;