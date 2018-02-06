# CnApi Endpoints
Taken from [here](https://github.com/joyent/sdc-cnapi/tree/master/lib/endpoints).  

## Allocations (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/allocations.js)  
  
1. POST /allocate  
* Given the provided constraints, returns a server chosen to allocate a new VM, as well as the steps taken to reach that decision. This does not cause the VM to actually be created (see VmCreate for that), but rather returns the UUID of an eligible server.
* Parameters:  
  * [Object] vm (Various required metadata for VM construction)
  * [Object] package (Description of dimensions used to construct VM)  
  * [Object] image (Description of image used to construct VM)  
  * [Array] nic_tags (Names of nic tags which servers must have)
  * [Array] servers (Optionally limit which servers to consider by providing their UUIDs)  
* Responses:
  * 200 - [Object] Server selected and steps taken
  * 409 - [Object] No server found, and steps and reasons why not
  * 500 - [Error] Could not process request  

2. POST /capacity
* Returns how much spare capacity there is on each server, specifically RAM (in MiB), CPU (in percentage of CPU, where 100 = 1 core), and disk (in MiB).
* Parameters:
  * [Array] servers (Optionally limit which servers to consider by providing their UUIDs)
* Responses:
  * 200 - [Object] Server capacities and any associated errors
  * 500 - [Error] Could not process request

## Boot Params (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/boot_params.js)

1. GET /boot/default  
* Returns the default boot parameters  
* Responses:
  * 200 - [Object] Default boot parameters and kernel_args
  * 404 - [None] No such server

2. PUT /boot/default  
* Completely override the existing boot parameter values with the given payload. Any values not present in the payload will effectively be deleted.  
* Parameters:
  * [String] platform (The platform image to use on next boot)
  * [Object] kernel_args (Key value pairs to be sent to server on boot)
  * [Array] boot_modules (List of boot module objects)
  * [Object] kernel_flags (Kernel flags to be sent to server on boot)
  * [Object] serial (Serial device to use (i.e. "ttyb"))
  * [Object] default_console (Default console type (i.e. "serial"))
* Responses
  * 204 - [None] Boot parameters successfully set
  * 404 - [None] No such server

3. POST /boot/default  
* If a value is present in the default boot parameters, but no new value is passed in, the currently effective value will remain unchanged.  
* Parameters:
  * [Object] kernel_args (Boot parms to update)
  * [Array] boot_modules (List of boot module objects)
  * [Object] kernel_flags (Kernel flags to update)
  * [String] platform (Set platform as the bootable platform)
* Responses:
  * 204 - [None] Boot parameters successfully set
  * 404 - [None] No such Server  

4. GET /boot/:server_uuid
* Returns the platform to be booted on the next reboot in addition to what kernel parameters will be used to boot the server.
* Responses: 
  * 200 - [Object] Default boot parameters and kernel_args
  * 404 - [None] No such Server

5. PUT /boot/:server_uuid  
* Completely override the existing boot parameter values with the given payload. Any values not present in the payload will effectively be deleted.  
* Parameters:
  * [String] platform (The platform image to use on next boot)
  * [Object] kernel_args (Key value pairs to be sent to server on boot)
  * [Array] boot_modules (List of boot module objects)
  * [Object] kernel_flags (Kernel flags to be sent to server on boot)
  * [Object] serial (Serial device to use (i.e. "ttyb"))
  * [Object] default_console (Default console type (i.e. "serial"))
* Responses
  * 204 - [None] Boot parameters successfully set
  * 404 - [None] No such server

6. POST /boot/:server_uuid  
* If a value is present in the default boot parameters, but no new value is passed in, the currently effective value will remain unchanged.  
* Parameters:
  * [Object] kernel_args (Boot parms to update)
  * [Array] boot_modules (List of boot module objects)
  * [Object] kernel_flags (Kernel flags to update)
  * [String] platform (Set platform as the bootable platform)
* Responses:
  * 204 - [None] Boot parameters successfully set
  * 404 - [None] No such Server  

## Images (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/images.js)

1. GET /servers/:server_uuid/images/:uuid
* Query the server for the Image's details.
* Parameters:
  * [String] jobid (Post information to workflow with this id)
* Responses: 
  * 200 - [Object] Request succeeded
  * 404 - [Object] No such Image
  * 404 - [Object] No such Server

## NICs (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/nics.js)

1. PUT /servers/:server_uuid/nics
* Modify the target server's nics.
* Parameters: 
  * action - [String] Nic action: 'update', 'replace', or 'delete'
  * nics - [Object] Array of nic objects
* Responses: 
  * 202 - [None] Workflow was created to modify nics
  * 404 - [Error] No such Server
  * 500 - [Error] Error occured with request: invalid parameters, server not setup, or error instantiating workflow

## Platforms (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/platforms.js)

1. GET /platforms
* Returns available platform images in datacenter
* Responses: 
  * 200 - [Array] The returned servers

## Servers (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/servers.js)

1. GET /servers
* Returns Servers present in datacenter
* Parameters:
  * uuids - [String] Comma seperated list of UUIDs to look up
  * setup - [Boolean] Return only setup servers
  * headnode - [Boolean] Return only headnodes
  * reserved - [Boolean] Return only reserved servers
  * reservoir - [Boolean] Return only reservoir servers
  * hostname - [String] Return server with given hostname
  * extras - [String] Comma seperated values: agents, vms, memory, disk, sysinfo, capacity, all
  * limit - [Integer] Maximum number of results to return. It must be between 1-1000, inclusive. Defaults to 1000 (the maxmimum allowed value).
  * offset - [Integer] Offset the subset of results returned
  * Responses:
    * 200 - [Array] The returned servers

2. GET /servers/:server_uuid
* Look up a single Server by UUID
* Responses:
  * 200 - [Object] The server object

3. POST /servers/:server_uuid
* Set the value of a Server's attribute
* Parameters:
  * agents - [Array] Array of agents present on this server
  * boot_platform - [String] The platform image to be used on next boot
  * default_console - [String] Console type
  * rack_identifier - [String] The id of ths server's rack
  * comments - [String] Any comments about the server
  * next_reboot - [String] ISO timestamp when the next server reboot is scheduled for
  * nics - [Array] List of nics to update
  * reserved - [Boolean] Server is available for provisioning
  * reservoir - [Boolean] Server should be considered last for provisioning
  * reservation_ratio - [Number] The reservation ratio
  * overprovision_ratios - [Object] The overprovisioning ratios. Must be an object with Number value keys and keys must be one of 'cpu', 'ram', 'disk', 'io', 'net'.
  * serial - [String] Serial device
  * setup - [Boolean] True if server has been set up
  * setting_up - [Boolean] True if server is in the process of setting up
  * transitional_status - [String] The fallback status if not 'running'. For example, if the server has to reboot, this value may be set to 'rebooting'.
  * traits - [Object] Server traits
* Responses: 
  * 204 - [None] The value was successfully set

4. POST /servers/:server_uuid/reboot
* Reboot the server
* Parameters:
  * origin - [String]
  * creater_uuid - [String]
* Responses:
  * 204 - [Object] Server reboot initiated
  * 500 - [None] Error attempting to set up server

5. PUT /servers/:server_uuid/factory-reset
* Reset the server back to a factory state
* Responses: 
  * 204 - [Object] Setup initiated, returns object containing workflow id
  * 500 - [None] Error attempting to set up server

6. PUT /servers/:server_uuid/setup
* Initiate the server setup process for a newly started server
* Parameters:
  * nics - [Object] Nic parameters to update
  * postsetup_script - [String] Script to run after setup has been completed 
  * hostname - [String] Hostname to set for the specified server
  * disk_spares - [String] See \`man disklayout\` spares
  * disk_cache - [String] See \`man disklayout\` cache
  * disk_layout - [String] See \`man disklayout\` type
* Responses: 
  * 200 - [Object] Setup initiated, returns object containing workflow id
  * 500 - [None] Error while processing request

7. POST /servers/:server_uuid/sysinfo-refresh
* Fetch a given server's sysinfo values and store them in the server object
* Responses: 
  * 200 - [Object] Sysinfo refresh initiated
  * 500 - [None] Error while processing request

8. DELETE /servers/:server_uuid
* Remove all references to given server. Does not change anything on the actual server.
* Responses: 
  * 204 - [None] Server was deleted successfully
  * 500 - [Error] Could not process request

9. GET /servers/:servers_uuid/task-history
* Return details of most recent cn-agent tasks to run on the compute node since cn-agent was started.
* Responses: 
  * 200 - [Ok] Tasks returned successfully
  * 500 - [Error] Could not process request

10. GET /servers/:server_uuid/cn-agent/pause
* Makes cn-agent stop accepting new tasks
* Responses: 
  * 204 - [None] Content on success
  * 500 - [Error] Could not process request

11. GET /servers/:server_uuid/cn-agent/resume
* Make cn-agent accept new tasks
* Responses: 
  * 204 - [None] Content on success
  * 500 - [Error] Could not process request

12. GET /servers/:server_uuid/ensure-image
* Assert an image is present on a compute node and ready for use in provisioning. If this is not the case, fetch and install the image onto the compute node zpool.
* Parameters:
  * image_uuid - [String] UUID of image to install
  * zfs\_storage\_pool\_name - [String] zpool on which to install image
* Responses:
  * 204 - [None] Tasks returned successfully
  * 500 - [Error] Could not process request

13. POST /servers/:server_uuid/install-agent
* Instruct server to install given agent. Pass in image uuid of package to install and server will download and install package.
* Parameter:
  * image_uuid - [String] UUID of image to install
  * package_name - [String] Package name
  * package_file - [String] Package file
* Responses:
  * 200 - [Ok] Install task initiated successfully
  * 500 - [Error] Could not process request

## Tasks (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/tasks.js)

1. GET /tasks/:task_id
* Returns the details of the given task
* Responses: 
  * 200 - [Object] Task details
  * 404 - [None] No such task found

2. GET /tasks/:task_id/wait
* Waits for a given task to return or an expiry to be reached.
* Responses:
  * 200 - [Object] Task details
  * 404 - [None] No such task found

## UR (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/ur.js)

1. POST /servers/:server_uuid/execute
* Synchronously execute a command on the target server
* Parameters: 
  * args - [Array] Array containing arguments to be passed in to command
  * env - [Object] Object containing environment variables to be passed in
  * script - [String] Script to be executed. Must have a sebang line
* Responses: 
  * 404 - [None] No such server
  * 500 - [None] Error occurred executing script

## Waitlist (https://github.com/joyent/sdc-cnapi/blob/master/lib/endpoints/waitlist.js)

1. GET /servers/:server_uuid/tickets
* Returns all waitlist tickets currently active on a server. Returns the uuid of the newly created ticket as well as an array of all the tickets in the ticket's scope queue. By default servers are returned in the chronological order of their creation (\`created_at\` timestamp). By default the responses are limited to 1000 results. Use the \`limit\` and \`offset\` to page through results.
* Parameters:
  * limit  - [Number] Return at most this many results
  * offset - [Number] Return results starting at this position
  * attribute - [String] Attribute to sort on
  * order - [String] Sort in 'DESC' or 'ASC' order
* Responses:
  * 200 - [Array] Waitlist returned succesfully
  * 500 - [Error] Could not process request

2. POST /servers/:server_uuid/tickets
* Create a new waitlist ticket
* Parameters:
  * scope - [String] Limit the ticket to the given scope
  * id - [String] The id of the resource of type 'scope'
  * expires_at - [String] ISO 8601 date string when ticket will expire
  * action - [String] Description of action to be undertaken
  * extra - [Object] Object containing client specific metadata
* Responses:
  * 202 - [Array] Waitlist ticket created successfully
  * 500 - [Error] Could not process request

3. POST /tickets/:ticket_uuid
* Retrieve a waitlist ticket
* Parameters:
  * 200 - [Array] Waitlist ticket returned successfully
  * 500 - [Error] Could not process request

4. DELETE /tickets/:ticket_uuid
* Delete a waitlist ticket
* Responses:
  * 204 - [Array] Waitlist ticket deleted successfully
  * 500 - [Error] Could not process request

5. DELETE /servers/:server_uuid/tickets
* Delete all of a server's waitlist tickets
* Responses: 
  * 204 - [Array] Waitlist ticket deleted successfully
  * 500 - [Error] Could not process request

6. GET /tickets/:ticket_uuid/wait
* Wait until a waitlist ticket either expires or becomes active
* Responses:
  * 204 - [Array] Ticket active or expired
  * 500 - [Error] Could not process request

7. GET /tickets/:ticket_uuid/release
* Release a currently active or queued waitlist ticket
* Responses:
  * 204 - [Array] Ticket released successfully
  * 500 - [Error] Could not process request