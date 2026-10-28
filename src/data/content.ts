
/** Stages of the 3D building sequence on the home page. */
export const constructionStages = [
  { title: 'Blueprint', body: 'Every building starts as a drawing. The structure is set out in lines before the first pile goes in.' },
  { title: 'Foundation', body: 'Bored piles and a reinforced raft spread the load of the building into the ground.' },
  { title: 'Columns and core', body: 'The concrete core and columns rise level by level, setting the grid for everything that follows.' },
  { title: 'Steel framework', body: 'Primary and secondary steel beams tie the columns together into a rigid frame.' },
  { title: 'Floors and walls', body: 'Composite floor slabs are cast and the solid parts of the envelope close the building in.' },
  { title: 'Glass facade', body: 'Unitised glass panels are hung floor by floor, with fins and crown details added last.' },
  { title: 'Completion', body: 'Services commissioned and lights on. Our name goes up on the roof and the building is ready for its first occupants.' },
]

/** The seven stages of a project, from first visit to handover. */
export const processSteps = [
  {
    title: 'Consultation and Planning',
    body: 'We meet you, visit the site and check the plot documents, road width and which authority the land falls under. You get a clear idea of what can be built and a first cost range.',
    output: 'Site visit notes, list of approvals needed, first cost range',
  },
  {
    title: 'Architectural Design',
    body: 'We plan the rooms and spaces, then prepare 2D and 3D elevations so you can see the building before you commit. Revisions are made with you until the design is right.',
    output: 'Floor plans, 2D and 3D elevations',
  },
  {
    title: 'Engineering and Approvals',
    body: 'Our engineers complete the structural design, and we prepare the building plan set and apply for TUDA, DTCP or municipal approval as your site requires.',
    output: 'Structural drawings, approval application',
  },
  {
    title: 'Site Preparation and Foundation',
    body: 'Marking on site, excavation, footings and plinth beams, built to the structural drawings and checked before concrete is poured.',
    output: 'Marking check, foundation inspection',
  },
  {
    title: 'Structural Construction',
    body: 'Columns, beams and slabs rise floor by floor, followed by brickwork, plastering and electrical and plumbing lines.',
    output: 'Regular progress updates with photos',
  },
  {
    title: 'Finishing and Quality Inspection',
    body: 'Flooring, painting, doors, windows and fixtures, then a room-by-room inspection with you to list anything that needs correcting.',
    output: 'Inspection checklist, corrections list',
  },
  {
    title: 'Final Handover',
    body: 'We hand over the keys with the approved plans, as-built drawings and warranties, and stay available for any follow-up work.',
    output: 'Keys, approved plans, as-built drawings',
  },
]

/**
 * Approvals the office assists with. Descriptions are general guidance;
 * which authority applies depends on where the site is.
 */
export const approvals = [
  {
    title: 'TUDA Approval',
    authority: 'Tirupati Urban Development Authority',
    body: 'Building and layout permission for sites that fall within the TUDA area around Tirupati.',
  },
  {
    title: 'DTCP Approval',
    authority: 'Directorate of Town and Country Planning, Andhra Pradesh',
    body: 'Layout and building approvals for sites in areas planned under DTCP.',
  },
  {
    title: 'Municipal Building Approvals',
    authority: 'Municipal corporation or municipality',
    body: 'Building permission for plots inside municipal limits, issued by the local urban body.',
  },
  {
    title: 'Layout Approvals',
    authority: 'TUDA or DTCP, depending on location',
    body: 'Approval to divide land into plots, with roads, open spaces and drainage planned to the rules.',
  },
  {
    title: 'Building Plan Approvals',
    authority: 'The authority your site falls under',
    body: 'Sanction of the building plan, checked for setbacks, height, floor area and parking, before work starts on site.',
  },
]
