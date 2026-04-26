// Extract JWT claims from context and forward as headers to subgraphs.
fn supergraph_service(service) {
    log_error("[rhai] supergraph_service called");
}

fn subgraph_service(service, subgraph) {
    let request_callback = |request| {
        let has_claims = request.context.contains("apollo::authentication::jwt_claims");
        log_warn(`[rhai] subgraph=${subgraph} has_jwt_claims=${has_claims}`);
        if has_claims {
            let claims = request.context["apollo::authentication::jwt_claims"];
            if claims != () {
                let sub = claims["sub"];
                log_warn(`[rhai] jwt sub=${sub}`);
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
