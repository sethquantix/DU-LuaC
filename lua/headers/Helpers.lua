--[[ Those are the DU-LuaC Helpers ]]

--- Returns a list of elements linked to the current Control Unit
---@param filters table<string, string> A list of filters where each key is a element function and the value is the desired value
---@param noLinkNames boolean When true the results will be keyed by the linking order instead of link name
---@return table<string|number, Element>
function library.getLinks(filters, noLinkNames) end

--- Returns a list of elements linked to the current Control Unit of a specified class
---@param className string The element class name you want to match against
---@param noLinkNames boolean When true the results will be keyed by the linking order instead of link name
---@return table<string|number, Element>
function library.getLinksByClass(className, noLinkNames) end

--- Returns the first element linked to the current Control Unit of a specified class
---@param className string The element class name you want to match against
---@return Element
function library.getLinkByClass(className) end

--- Returns the linked Core Unit
---@return CoreUnit
function library.getCoreUnit() end

--- Returns a linked element with matching name
---@param elementName string The element name to be matched against
---@return Element
function library.getLinkByName(elementName) end

--- Adds event handling to an object's instance
---@param obj table The object you are adding events to
function library.addEventHandlers(obj) end

--- Embeds a local file (from your LuaC project) as a Lua string
---@param file string The file you are embedding
---@return string
function library.embedFile(file) end