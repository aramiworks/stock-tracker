// Extract JWT claims from context and forward as headers to subgraphs.
fn supergraph_service(service) {
    log_info("[rhai] supergraph_service called");
}

fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        // Strip any client-supplied identity headers unconditionally so subgraphs
        // only ever receive router-controlled values.
        request.headers.remove("x-user-id");
        request.headers.remove("x-user-role");
        let has_claims = request.context.contains("apollo_authentication::JWT::claims");
        log_info(`[rhai] subgraph=${subgraph} has_jwt_claims=${has_claims}`);
        if has_claims {
            let claims = request.context["apollo_authentication::JWT::claims"];
            if claims != () {
                let sub = claims["sub"];
                log_info(`[rhai] jwt sub=${sub}`);
                if sub != () {
                    request.headers["x-user-id"] = sub.to_string();
                }
                let role = claims["role"];
                if role != () {
                    request.headers["x-user-role"] = role.to_string();
                }
            }
        }
    };
    service.map_request(request_callback);
}
